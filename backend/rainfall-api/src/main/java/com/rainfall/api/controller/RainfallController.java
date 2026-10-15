package com.rainfall.api.controller;

import com.rainfall.api.service.RainfallService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST controller exposing all rainfall data endpoints.
 *
 * All query parameters are optional; when omitted the full dataset is used.
 * Pagination defaults: page=0, size=50.
 */
@RestController
@RequestMapping("/api/rainfall")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class RainfallController {

    private final RainfallService rainfallService;

    // ------------------------------------------------------------------
    // GET /api/rainfall/metadata
    // ------------------------------------------------------------------
    @GetMapping("/metadata")
    public ResponseEntity<Map<String, Object>> metadata() {
        return ResponseEntity.ok(rainfallService.getMetadata());
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/summary
    // ------------------------------------------------------------------
    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> summary(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision) {

        return ResponseEntity.ok(rainfallService.getSummary(startYear, endYear, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/yearly
    // ------------------------------------------------------------------
    @GetMapping("/yearly")
    public ResponseEntity<List<Map<String, Object>>> yearly(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision) {

        return ResponseEntity.ok(rainfallService.getYearlyData(startYear, endYear, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/monthly
    // ------------------------------------------------------------------
    @GetMapping("/monthly")
    public ResponseEntity<List<Map<String, Object>>> monthly(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision) {

        return ResponseEntity.ok(rainfallService.getMonthlyData(startYear, endYear, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/seasonal
    // ------------------------------------------------------------------
    @GetMapping("/seasonal")
    public ResponseEntity<List<Map<String, Object>>> seasonal(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision) {

        return ResponseEntity.ok(rainfallService.getSeasonalData(startYear, endYear, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/seasonal/yearly
    // ------------------------------------------------------------------
    @GetMapping("/seasonal/yearly")
    public ResponseEntity<List<Map<String, Object>>> seasonalByYear(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision) {

        return ResponseEntity.ok(rainfallService.getSeasonalByYear(startYear, endYear, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/statistics
    // ------------------------------------------------------------------
    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> statistics(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision) {

        return ResponseEntity.ok(rainfallService.getStatistics(startYear, endYear, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/records
    // ------------------------------------------------------------------
    @GetMapping("/records")
    public ResponseEntity<Map<String, Object>> records(
            @RequestParam(required = false) Integer startYear,
            @RequestParam(required = false) Integer endYear,
            @RequestParam(required = false) String  subdivision,
            @RequestParam(defaultValue = "0")      int page,
            @RequestParam(defaultValue = "50")     int size,
            @RequestParam(defaultValue = "year")   String sortBy,
            @RequestParam(defaultValue = "true")   boolean ascending) {

        // Guard against excessively large page sizes
        size = Math.min(size, 500);
        return ResponseEntity.ok(
                rainfallService.getRecords(startYear, endYear, subdivision, page, size, sortBy, ascending));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/subdivisions
    // ------------------------------------------------------------------
    @GetMapping("/subdivisions")
    public ResponseEntity<List<String>> subdivisions() {
        return ResponseEntity.ok(rainfallService.getSubdivisions());
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/compare?year1=&year2=&subdivision=
    // ------------------------------------------------------------------
    @GetMapping("/compare")
    public ResponseEntity<?> compare(
            @RequestParam(required = false) Integer year1,
            @RequestParam(required = false) Integer year2,
            @RequestParam(required = false) String subdivision) {

        if (year1 == null || year2 == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Both year1 and year2 are required query parameters."));
        }
        if (year1.equals(year2)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "year1 and year2 must be different."));
        }
        int[] range = rainfallService.getYearRange();
        if (year1 < range[0] || year1 > range[1] || year2 < range[0] || year2 > range[1]) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            String.format("Years must be within dataset range %d–%d.", range[0], range[1])));
        }
        return ResponseEntity.ok(rainfallService.compare(year1, year2, subdivision));
    }

    // ------------------------------------------------------------------
    // GET /api/rainfall/map-data?year=&field=
    // Returns per-subdivision rainfall for choropleth map.
    // field: annual (default), jan-dec, janFeb, marMay, junSep, octDec
    // ------------------------------------------------------------------
    @GetMapping("/map-data")
    public ResponseEntity<?> mapData(
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false, defaultValue = "annual") String field) {

        if (year == null) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "year is required."));
        }
        int[] range = rainfallService.getYearRange();
        if (year < range[0] || year > range[1]) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error",
                            String.format("year must be within dataset range %d–%d.", range[0], range[1])));
        }
        return ResponseEntity.ok(rainfallService.getMapData(year, field));
    }
}
