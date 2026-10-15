package com.rainfall.api.service;

import com.rainfall.api.model.RainfallRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * High-level service that applies filters, aggregations, and queries
 * to the in-memory rainfall records loaded by DataLoaderService.
 *
 * All business logic lives here, not in controllers.
 */
@Service
@RequiredArgsConstructor
public class RainfallService {

    private final DataLoaderService dataLoader;
    private final StatisticsService stats;

    // -------------------------------------------------------------------------
    // Helpers – filtering
    // -------------------------------------------------------------------------

    public List<RainfallRecord> filter(Integer startYear, Integer endYear, String subdivision) {
        return dataLoader.getAllRecords().stream()
                .filter(r -> startYear == null || r.getYear() >= startYear)
                .filter(r -> endYear   == null || r.getYear() <= endYear)
                .filter(r -> subdivision == null || subdivision.isBlank()
                          || r.getSubdivision().equalsIgnoreCase(subdivision))
                .collect(Collectors.toList());
    }

    public List<String> getSubdivisions() {
        return dataLoader.getAllRecords().stream()
                .map(RainfallRecord::getSubdivision)
                .distinct()
                .sorted()
                .collect(Collectors.toList());
    }

    public int[] getYearRange() {
        List<RainfallRecord> all = dataLoader.getAllRecords();
        int min = all.stream().mapToInt(RainfallRecord::getYear).min().orElse(1901);
        int max = all.stream().mapToInt(RainfallRecord::getYear).max().orElse(2015);
        return new int[]{min, max};
    }

    // -------------------------------------------------------------------------
    // Annual aggregation
    // -------------------------------------------------------------------------

    /**
     * Returns one entry per year with the MEAN annual rainfall across all
     * subdivisions in the filtered set.
     */
    public List<Map<String, Object>> getYearlyData(Integer startYear, Integer endYear, String subdivision) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);

        Map<Integer, List<Double>> byYear = new TreeMap<>();
        for (RainfallRecord r : filtered) {
            if (r.getAnnual() != null) {
                byYear.computeIfAbsent(r.getYear(), k -> new ArrayList<>()).add(r.getAnnual());
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Integer, List<Double>> e : byYear.entrySet()) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("year", e.getKey());
            double avg = stats.mean(e.getValue());
            row.put("rainfall", stats.round(avg, 2));
            row.put("count", e.getValue().size());
            result.add(row);
        }

        // Add year-to-year change
        for (int i = 1; i < result.size(); i++) {
            double prev = (double) result.get(i - 1).get("rainfall");
            double curr = (double) result.get(i).get("rainfall");
            Double change = stats.percentageChange(curr, prev);
            result.get(i).put("changePercent", change != null ? stats.round(change, 2) : null);
        }

        return result;
    }

    // -------------------------------------------------------------------------
    // Monthly aggregation
    // -------------------------------------------------------------------------

    private static final String[] MONTHS = {"JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"};
    private static final String[] MONTH_NAMES = {"January","February","March","April","May","June",
            "July","August","September","October","November","December"};

    public List<Map<String, Object>> getMonthlyData(Integer startYear, Integer endYear, String subdivision) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);

        // Average each month over all filtered records
        double[] sums   = new double[12];
        int[]    counts = new int[12];

        for (RainfallRecord r : filtered) {
            Double[] vals = monthlyValues(r);
            for (int i = 0; i < 12; i++) {
                if (vals[i] != null) {
                    sums[i]   += vals[i];
                    counts[i] += 1;
                }
            }
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (int i = 0; i < 12; i++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("month", MONTHS[i]);
            row.put("monthName", MONTH_NAMES[i]);
            row.put("monthNumber", i + 1);
            row.put("rainfall", counts[i] > 0 ? stats.round(sums[i] / counts[i], 2) : 0.0);
            row.put("count", counts[i]);
            result.add(row);
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // Seasonal aggregation
    // -------------------------------------------------------------------------

    /**
     * Indian meteorological seasons:
     *  Winter        : Jan, Feb
     *  Pre-Monsoon   : Mar, Apr, May
     *  SW Monsoon    : Jun, Jul, Aug, Sep
     *  Post-Monsoon  : Oct, Nov, Dec
     */
    public List<Map<String, Object>> getSeasonalData(Integer startYear, Integer endYear, String subdivision) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);

        double[] seasonSums   = new double[4];
        int[]    seasonCounts = new int[4];

        for (RainfallRecord r : filtered) {
            Double[] mv = monthlyValues(r);
            // Season 0: Winter (Jan=0, Feb=1)
            addSeason(seasonSums, seasonCounts, 0, mv[0], mv[1]);
            // Season 1: Pre-Monsoon (Mar=2, Apr=3, May=4)
            addSeason(seasonSums, seasonCounts, 1, mv[2], mv[3], mv[4]);
            // Season 2: SW Monsoon (Jun=5, Jul=6, Aug=7, Sep=8)
            addSeason(seasonSums, seasonCounts, 2, mv[5], mv[6], mv[7], mv[8]);
            // Season 3: Post-Monsoon (Oct=9, Nov=10, Dec=11)
            addSeason(seasonSums, seasonCounts, 3, mv[9], mv[10], mv[11]);
        }

        String[] seasonNames = {"Winter (Jan-Feb)", "Pre-Monsoon (Mar-May)",
                                "SW Monsoon (Jun-Sep)", "Post-Monsoon (Oct-Dec)"};
        String[] seasonKeys  = {"winter","preMonsoon","swMonsoon","postMonsoon"};

        List<Map<String, Object>> result = new ArrayList<>();
        double totalSeasonal = 0;
        double[] avgs = new double[4];
        for (int i = 0; i < 4; i++) {
            avgs[i] = seasonCounts[i] > 0 ? stats.round(seasonSums[i] / seasonCounts[i], 2) : 0.0;
            totalSeasonal += avgs[i];
        }

        for (int i = 0; i < 4; i++) {
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("season", seasonKeys[i]);
            row.put("seasonName", seasonNames[i]);
            row.put("rainfall", avgs[i]);
            row.put("contribution", totalSeasonal > 0
                    ? stats.round((avgs[i] / totalSeasonal) * 100, 1) : 0.0);
            result.add(row);
        }
        return result;
    }

    /**
     * Year-by-year breakdown of each season.
     */
    public List<Map<String, Object>> getSeasonalByYear(Integer startYear, Integer endYear, String subdivision) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);

        // Group by year
        Map<Integer, List<RainfallRecord>> byYear = new TreeMap<>();
        for (RainfallRecord r : filtered) {
            byYear.computeIfAbsent(r.getYear(), k -> new ArrayList<>()).add(r);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Map.Entry<Integer, List<RainfallRecord>> entry : byYear.entrySet()) {
            int year = entry.getKey();
            List<RainfallRecord> recs = entry.getValue();

            double winter = avgSeason(recs, 0, 1);
            double preMon = avgSeason(recs, 2, 3, 4);
            double swMon  = avgSeason(recs, 5, 6, 7, 8);
            double postMon= avgSeason(recs, 9, 10, 11);

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("year", year);
            row.put("winter", stats.round(winter, 2));
            row.put("preMonsoon", stats.round(preMon, 2));
            row.put("swMonsoon", stats.round(swMon, 2));
            row.put("postMonsoon", stats.round(postMon, 2));
            result.add(row);
        }
        return result;
    }

    // -------------------------------------------------------------------------
    // Statistics summary
    // -------------------------------------------------------------------------

    public Map<String, Object> getStatistics(Integer startYear, Integer endYear, String subdivision) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);
        List<Double> annualValues = stats.filterNonNull(
                filtered.stream().map(RainfallRecord::getAnnual).collect(Collectors.toList()));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("count",  annualValues.size());
        result.put("mean",   stats.round(stats.mean(annualValues), 2));
        result.put("median", stats.round(stats.median(annualValues), 2));
        result.put("min",    stats.round(stats.min(annualValues), 2));
        result.put("max",    stats.round(stats.max(annualValues), 2));
        result.put("range",  stats.round(stats.range(annualValues), 2));
        result.put("variance", stats.round(stats.variance(annualValues), 2));
        result.put("stdDev", stats.round(stats.standardDeviation(annualValues), 2));
        result.put("cv",     stats.round(stats.coefficientOfVariation(annualValues), 2));
        return result;
    }

    // -------------------------------------------------------------------------
    // Summary / Dashboard
    // -------------------------------------------------------------------------

    public Map<String, Object> getSummary(Integer startYear, Integer endYear, String subdivision) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);
        List<Double> annuals = stats.filterNonNull(
                filtered.stream().map(RainfallRecord::getAnnual).collect(Collectors.toList()));

        int[] range = getYearRange();

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("totalRecords",      dataLoader.getRecordCount());
        result.put("filteredRecords",   filtered.size());
        result.put("datasetStartYear",  range[0]);
        result.put("datasetEndYear",    range[1]);
        result.put("averageAnnual",     annuals.isEmpty() ? null : stats.round(stats.mean(annuals), 2));
        result.put("maxAnnual",         annuals.isEmpty() ? null : stats.round(stats.max(annuals), 2));
        result.put("minAnnual",         annuals.isEmpty() ? null : stats.round(stats.min(annuals), 2));
        result.put("stdDev",            annuals.isEmpty() ? null : stats.round(stats.standardDeviation(annuals), 2));
        result.put("subdivisions",      getSubdivisions().size());
        result.put("selectedStartYear", startYear != null ? startYear : range[0]);
        result.put("selectedEndYear",   endYear   != null ? endYear   : range[1]);

        // Find year with highest / lowest mean rainfall
        if (!filtered.isEmpty()) {
            Map<Integer, List<Double>> byYear = new TreeMap<>();
            for (RainfallRecord r : filtered) {
                if (r.getAnnual() != null)
                    byYear.computeIfAbsent(r.getYear(), k -> new ArrayList<>()).add(r.getAnnual());
            }

            int bestYear = -1; double bestVal = Double.MIN_VALUE;
            int worstYear = -1; double worstVal = Double.MAX_VALUE;
            for (Map.Entry<Integer, List<Double>> e : byYear.entrySet()) {
                double avg = stats.mean(e.getValue());
                if (avg > bestVal)  { bestVal  = avg; bestYear  = e.getKey(); }
                if (avg < worstVal) { worstVal = avg; worstYear = e.getKey(); }
            }
            result.put("highestRainfallYear",   bestYear != -1  ? bestYear  : null);
            result.put("highestRainfallValue",  bestYear != -1  ? stats.round(bestVal, 2) : null);
            result.put("lowestRainfallYear",    worstYear != -1 ? worstYear : null);
            result.put("lowestRainfallValue",   worstYear != -1 ? stats.round(worstVal, 2) : null);
        }

        return result;
    }

    // -------------------------------------------------------------------------
    // Records (paginated)
    // -------------------------------------------------------------------------

    public Map<String, Object> getRecords(Integer startYear, Integer endYear, String subdivision,
                                          int page, int size, String sortBy, boolean ascending) {
        List<RainfallRecord> filtered = filter(startYear, endYear, subdivision);

        // Sort
        Comparator<RainfallRecord> comp = switch (sortBy) {
            case "year"        -> Comparator.comparingInt(RainfallRecord::getYear);
            case "annual"      -> Comparator.comparingDouble(r -> r.getAnnual() != null ? r.getAnnual() : 0.0);
            case "subdivision" -> Comparator.comparing(RainfallRecord::getSubdivision);
            default            -> Comparator.comparingInt(RainfallRecord::getYear);
        };
        if (!ascending) comp = comp.reversed();
        filtered.sort(comp);

        int total = filtered.size();
        int from  = Math.min(page * size, total);
        int to    = Math.min(from + size, total);
        List<RainfallRecord> page_records = filtered.subList(from, to);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("records",     page_records);
        result.put("totalCount",  total);
        result.put("page",        page);
        result.put("pageSize",    size);
        result.put("totalPages",  (int) Math.ceil((double) total / size));
        return result;
    }

    // -------------------------------------------------------------------------
    // Metadata
    // -------------------------------------------------------------------------

    public Map<String, Object> getMetadata() {
        int[] range = getYearRange();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("datasetName",   "Rainfall in India 1901–2015");
        result.put("source",        "India Meteorological Department (IMD) via data.gov.in");
        result.put("sourceUrl",     "https://www.data.gov.in/catalog/rainfall-india");
        result.put("license",       "National Data Sharing and Accessibility Policy (NDSAP)");
        result.put("totalRecords",  dataLoader.getRecordCount());
        result.put("startYear",     range[0]);
        result.put("endYear",       range[1]);
        result.put("subdivisions",  getSubdivisions());
        result.put("unit",          "Millimetres (mm)");
        result.put("columns",       List.of("SUBDIVISION","YEAR","JAN","FEB","MAR","APR","MAY","JUN",
                                            "JUL","AUG","SEP","OCT","NOV","DEC","ANNUAL",
                                            "Jan-Feb","Mar-May","Jun-Sep","Oct-Dec"));
        result.put("seasons", Map.of(
            "Winter",       "January, February",
            "Pre-Monsoon",  "March, April, May",
            "SW Monsoon",   "June, July, August, September",
            "Post-Monsoon", "October, November, December"
        ));
        return result;
    }

    // -------------------------------------------------------------------------
    // Compare two years
    // -------------------------------------------------------------------------

    public Map<String, Object> compare(int year1, int year2, String subdivision) {
        List<RainfallRecord> r1 = filter(year1, year1, subdivision);
        List<RainfallRecord> r2 = filter(year2, year2, subdivision);

        // Historical mean for context
        List<Double> allAnnuals = stats.filterNonNull(
                filter(null, null, subdivision).stream()
                        .map(RainfallRecord::getAnnual).collect(Collectors.toList()));
        double historicalMean = stats.mean(allAnnuals);

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("year1",    buildYearSummary(year1, r1, historicalMean));
        result.put("year2",    buildYearSummary(year2, r2, historicalMean));
        result.put("historicalMean", stats.round(historicalMean, 2));

        Double ann1 = extractMean(r1);
        Double ann2 = extractMean(r2);
        result.put("differenceAbsolute", (ann1 != null && ann2 != null)
                ? stats.round(ann2 - ann1, 2) : null);
        result.put("differencePercent",  stats.percentageChange(ann2, ann1) != null
                ? stats.round(stats.percentageChange(ann2, ann1), 2) : null);
        return result;
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    private Double[] monthlyValues(RainfallRecord r) {
        return new Double[]{r.getJan(), r.getFeb(), r.getMar(), r.getApr(),
                            r.getMay(), r.getJun(), r.getJul(), r.getAug(),
                            r.getSep(), r.getOct(), r.getNov(), r.getDec()};
    }

    private void addSeason(double[] sums, int[] counts, int idx, Double... vals) {
        double sum = 0; int cnt = 0;
        for (Double v : vals) { if (v != null) { sum += v; cnt++; } }
        if (cnt > 0) { sums[idx] += sum; counts[idx]++; }
    }

    private double avgSeason(List<RainfallRecord> recs, int... monthIndices) {
        double sum = 0; int cnt = 0;
        for (RainfallRecord r : recs) {
            Double[] mv = monthlyValues(r);
            for (int idx : monthIndices) {
                if (mv[idx] != null) { sum += mv[idx]; cnt++; }
            }
        }
        return cnt > 0 ? sum / cnt : 0.0;
    }

    private Map<String, Object> buildYearSummary(int year, List<RainfallRecord> recs, double historicalMean) {
        List<Double> annuals = stats.filterNonNull(recs.stream().map(RainfallRecord::getAnnual).collect(Collectors.toList()));
        double avg = annuals.isEmpty() ? 0 : stats.mean(annuals);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("year",    year);
        m.put("rainfall", stats.round(avg, 2));
        m.put("deviationFromMean", avg > 0 ? stats.round(stats.deviationFromMean(avg, historicalMean), 2) : null);
        m.put("records", recs.size());
        return m;
    }

    private Double extractMean(List<RainfallRecord> recs) {
        List<Double> a = stats.filterNonNull(recs.stream().map(RainfallRecord::getAnnual).collect(Collectors.toList()));
        return a.isEmpty() ? null : stats.mean(a);
    }

    // -------------------------------------------------------------------------
    // Map choropleth data  –  one row per subdivision
    // -------------------------------------------------------------------------

    /**
     * Returns rainfall per subdivision for a given year and optional field.
     *
     * @param year      Required.  Must be within dataset range.
     * @param field     Optional.  "annual" (default), "janFeb", "marMay", "junSep", "octDec",
     *                             or a month abbreviation: "jan","feb","mar","apr","may",
     *                             "jun","jul","aug","sep","oct","nov","dec"
     * @return List of { subdivision, rainfall, historicalMean, deviationPct }
     */
    public List<Map<String, Object>> getMapData(int year, String field) {
        String f = (field == null || field.isBlank()) ? "annual" : field.trim().toLowerCase();

        // All records for the chosen year
        List<RainfallRecord> yearRecs = filter(year, year, null);
        // All records ever (for historical means)
        List<RainfallRecord> allRecs  = dataLoader.getAllRecords();

        // Compute historical mean per subdivision for the same field
        Map<String, Double> historicalMeans = new LinkedHashMap<>();
        for (String sub : getSubdivisions()) {
            List<RainfallRecord> subAll = allRecs.stream()
                    .filter(r -> r.getSubdivision().equalsIgnoreCase(sub))
                    .collect(Collectors.toList());
            List<Double> vals = stats.filterNonNull(
                    subAll.stream().map(r -> extractField(r, f)).collect(Collectors.toList()));
            historicalMeans.put(sub, vals.isEmpty() ? null : stats.mean(vals));
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (String sub : getSubdivisions()) {
            List<RainfallRecord> subYear = yearRecs.stream()
                    .filter(r -> r.getSubdivision().equalsIgnoreCase(sub))
                    .collect(Collectors.toList());

            // Take the first (and typically only) record per subdivision-year
            Double rainfall = null;
            if (!subYear.isEmpty()) {
                rainfall = extractField(subYear.get(0), f);
            }

            Double histMean = historicalMeans.get(sub);
            Double dev = (rainfall != null && histMean != null && histMean != 0.0)
                    ? stats.round(stats.deviationFromMean(rainfall, histMean), 1)
                    : null;

            Map<String, Object> row = new LinkedHashMap<>();
            row.put("subdivision",      sub);
            row.put("rainfall",         rainfall != null ? stats.round(rainfall, 1) : null);
            row.put("historicalMean",   histMean  != null ? stats.round(histMean, 1)  : null);
            row.put("deviationPct",     dev);
            row.put("year",             year);
            row.put("field",            f);
            result.add(row);
        }
        return result;
    }

    /** Extract a named field value from a record.  Returns null for unknown fields. */
    private Double extractField(RainfallRecord r, String field) {
        return switch (field) {
            case "annual"   -> r.getAnnual();
            case "janfeb"   -> r.getJanFeb();
            case "marmay"   -> r.getMarMay();
            case "junsep"   -> r.getJunSep();
            case "octdec"   -> r.getOctDec();
            case "jan"      -> r.getJan();
            case "feb"      -> r.getFeb();
            case "mar"      -> r.getMar();
            case "apr"      -> r.getApr();
            case "may"      -> r.getMay();
            case "jun"      -> r.getJun();
            case "jul"      -> r.getJul();
            case "aug"      -> r.getAug();
            case "sep"      -> r.getSep();
            case "oct"      -> r.getOct();
            case "nov"      -> r.getNov();
            case "dec"      -> r.getDec();
            default         -> r.getAnnual();
        };
    }
}
