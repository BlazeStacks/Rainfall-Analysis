# PROJECT REPORT

---

## 1. Title of Project

**Rainfall Variation and Seasonal Patterns**

---

## 2. Abstract

This project presents a full-stack web application for the descriptive statistical analysis of historical Indian rainfall data spanning 115 years (1901–2015). The dataset, published by the India Meteorological Department (IMD) and available through the Government of India's Open Government Data (OGD) Platform, contains monthly and annual rainfall records for 36 meteorological subdivisions across India.

The application is implemented using React and Vite for the frontend, and Java 21 with Spring Boot 3.3 for the backend REST API. Rainfall data is loaded from a CSV file into memory at server startup using Apache Commons CSV, removing the need for an external database in the development environment.

Statistical analysis is performed entirely on real dataset values. The implemented mathematical operations include arithmetic mean, median, population variance, standard deviation, coefficient of variation, year-to-year percentage change, historical deviation, and seasonal contribution percentages. These calculations are applied to annual and monthly rainfall observations filtered by year range and IMD subdivision.

Interactive visualisations — including yearly trend charts, monthly distribution bar charts, seasonal stacked charts, and a radar chart — are built using Recharts and rendered in the browser. Users can compare any two years against the historical mean, filter by region and period, and export data as CSV.

The project demonstrates data acquisition from an authoritative government source, CSV data processing, REST API design, statistical computation, and professional data visualisation — without employing machine learning, artificial intelligence, or predictive modelling.

---

## 3. Objectives

1. **Load and process** the real India Meteorological Department rainfall dataset (1901–2015) and make it queryable through a REST API with year, region, and pagination filters.

2. **Compute and display** seven descriptive statistics (mean, median, range, variance, standard deviation, coefficient of variation, and year-to-year percentage change) for any user-selected period and IMD subdivision.

3. **Visualise** rainfall patterns through interactive charts covering yearly trends, monthly distributions, meteorological seasonal breakdowns, and regional comparisons.

4. **Document** the dataset source, mathematical methodology, season definitions, and software architecture in a structured, reproducible project suitable for academic review.

---

## 4. Dataset

| Attribute              | Detail |
|------------------------|--------|
| **Name**               | Rainfall in India (1901–2015) |
| **Publisher**          | India Meteorological Department (IMD), Ministry of Earth Sciences |
| **Platform**           | Open Government Data (OGD) Platform India |
| **Catalog URL**        | https://www.data.gov.in/catalog/rainfall-india |
| **License**            | National Data Sharing and Accessibility Policy (NDSAP) |
| **File format**        | CSV (comma-separated values) |
| **Records**            | Approximately 4,115 rows (36 subdivisions × ~115 years, some years missing) |
| **Columns**            | 18 (SUBDIVISION, YEAR, 12 monthly columns, ANNUAL, 4 seasonal totals) |
| **Temporal coverage**  | 1901–2015 |
| **Geographic coverage**| 36 IMD meteorological subdivisions across India |
| **Unit**               | Millimetres (mm) |
| **Missing values**     | Empty cells; excluded from all calculations (not treated as zero) |

### Column Summary

| Column     | Description                          |
|------------|--------------------------------------|
| SUBDIVISION| IMD subdivision name                 |
| YEAR       | Calendar year                        |
| JAN–DEC    | Monthly rainfall (mm)                |
| ANNUAL     | Annual total (mm)                    |
| Jan-Feb    | Winter season total (mm)             |
| Mar-May    | Pre-monsoon season total (mm)        |
| Jun-Sep    | SW Monsoon season total (mm)         |
| Oct-Dec    | Post-monsoon season total (mm)       |

---

## 5. Software

### Frontend
| Technology      | Version | Purpose |
|-----------------|---------|---------|
| React           | 18      | UI component framework |
| Vite            | 6       | Build tool and development server |
| Tailwind CSS    | 3       | Utility-first CSS styling |
| React Router    | 6       | Client-side page routing |

### Backend
| Technology      | Version | Purpose |
|-----------------|---------|---------|
| Java            | 21      | Programming language |
| Spring Boot     | 3.3.4   | REST API framework |
| Maven           | 3.9     | Build and dependency management |

### Database
- No database is required. Rainfall data is parsed from CSV into JVM memory at application startup.
- PostgreSQL integration can be added using Spring Data JPA if persistent storage is needed.

---

## 6. Libraries

| Library                  | Context    | Purpose |
|--------------------------|------------|---------|
| Recharts                 | Frontend   | SVG-based interactive charts (area, bar, line, radar) |
| Lucide React             | Frontend   | Consistent icon set |
| Apache Commons CSV       | Backend    | CSV parsing with configurable format and header skipping |
| Jackson Databind         | Backend    | JSON serialisation of API responses |
| Spring Boot Starter Web  | Backend    | REST controller, Tomcat server, CORS |
| Spring Boot Starter Validation | Backend | Request parameter validation |
| JUnit 5                  | Backend    | Unit testing framework |
| Lombok                   | Backend    | Boilerplate reduction (getters, builders) |

---

## 7. Functions Used

### Statistical Functions (StatisticsService.java)

| Function                  | Formula |
|---------------------------|---------|
| `mean(values)`            | μ = Σxᵢ / n |
| `median(values)`          | Middle of sorted list; average of two middles for even n |
| `min(values)`             | min(x₁…xₙ) |
| `max(values)`             | max(x₁…xₙ) |
| `range(values)`           | max − min |
| `variance(values)`        | σ² = Σ(xᵢ − μ)² / n  (population variance) |
| `standardDeviation(values)` | σ = √σ² |
| `coefficientOfVariation(values)` | CV = (σ / μ) × 100 |
| `percentageChange(curr, prev)` | ((curr − prev) / prev) × 100 |
| `deviationFromMean(value, mean)` | ((value − mean) / mean) × 100 |
| `seasonalContribution(seasonal, annual)` | (seasonal / annual) × 100 |
| `filterNonNull(values)`   | Removes null entries before calculation |
| `round(value, places)`    | Rounds to specified decimal precision |

### Data Processing Functions (RainfallService.java)

| Function              | Description |
|-----------------------|-------------|
| `filter()`            | Applies year range and subdivision filters to in-memory list |
| `getYearlyData()`     | Groups records by year, computes mean annual rainfall per year |
| `getMonthlyData()`    | Averages each of 12 months across all filtered records |
| `getSeasonalData()`   | Computes average seasonal rainfall and % contribution |
| `getSeasonalByYear()` | Year-by-year seasonal breakdown for stacked chart |
| `getStatistics()`     | Applies all statistical functions to annual values |
| `getSummary()`        | Computes KPI dashboard values |
| `getRecords()`        | Paginates and sorts filtered raw records |
| `compare()`           | Compares two years against historical mean |

### CSV Loading (DataLoaderService.java)

| Function      | Description |
|---------------|-------------|
| `load()`      | Spring `@PostConstruct` — loads CSV at startup |
| `resolveReader()` | Searches external paths then classpath for the CSV |
| `parseRow()`  | Maps each CSV row to a `RainfallRecord` object |
| `parseDouble()` | Safely parses numeric cells; returns null for empty/NA |

---

## 8. Methodology Used

### 8.1 Data Acquisition

The rainfall dataset was downloaded from the India Meteorological Department via the Government of India's Open Government Data Platform (data.gov.in). The original CSV contains subdivision-level monthly rainfall observations from 1901 to 2015.

### 8.2 Data Loading and Validation

At Spring Boot application startup, `DataLoaderService` reads the CSV using Apache Commons CSV. Each row is parsed into a `RainfallRecord` object. Empty cells and "NA" values are stored as `null` (not zero). Malformed rows are skipped with a warning log. The complete dataset is held in a JVM `ArrayList` and served from memory for all API requests.

### 8.3 Filtering

All API endpoints accept optional `startYear`, `endYear`, and `subdivision` query parameters. Filtering is applied via Java Stream operations before aggregation or statistics are computed.

### 8.4 Aggregation

**Yearly:** Records are grouped by year using a `TreeMap`. For each year, the mean annual rainfall across all filtered subdivisions is computed.

**Monthly:** Monthly columns (JAN–DEC) are summed across all filtered records and divided by the count of non-null observations for each month.

**Seasonal:** Monthly values are summed into four IMD seasons:
- Winter: Jan, Feb
- Pre-Monsoon: Mar, Apr, May
- SW Monsoon: Jun, Jul, Aug, Sep
- Post-Monsoon: Oct, Nov, Dec

### 8.5 Statistical Computations

**Arithmetic Mean:**
```
μ = Σxᵢ / n
```

**Median:**
Sort observations; take middle value (or average of two middle values for even n).

**Population Variance:**
```
σ² = Σ(xᵢ − μ)² / n
```
Population variance (÷ n) is used because the dataset is the complete historical record, not a drawn sample.

**Standard Deviation:**
```
σ = √σ²
```

**Coefficient of Variation:**
```
CV = (σ / μ) × 100    (undefined when μ = 0)
```

**Year-to-Year Percentage Change:**
```
Δ% = ((currentYear − previousYear) / previousYear) × 100
```
Returns null when the previous value is zero or missing.

**Historical Deviation:**
```
deviation% = ((value − historicalMean) / historicalMean) × 100
```
Used in the year comparison feature to show how a selected year compares to the long-term average.

**Seasonal Contribution:**
```
contribution% = (seasonalRainfall / annualRainfall) × 100
```

### 8.6 Visualisation

Charts are implemented using Recharts:
- **AreaChart** — Yearly rainfall trend (Dashboard)
- **LineChart with ReferenceLine** — Annual trend with historical mean (Rainfall Analysis)
- **BarChart** — Year-over-year change, monthly distribution, seasonal comparison
- **RadarChart** — Seasonal shape comparison
- **Stacked BarChart** — Year-by-year seasonal breakdown

All chart values are fetched from the backend API and reflect real computed observations. No values are hardcoded.

---

## 9. Performance Metrics

Since this is a **descriptive statistical analytics** project (not a predictive machine learning model), classical ML metrics (accuracy, precision, recall, F1, RMSE) are not applicable. The following metrics were used instead:

| Metric                          | Value / Status |
|---------------------------------|----------------|
| **Total records loaded**        | 4,116 rows     |
| **Valid annual observations**   | 4,090 (rows where ANNUAL ≠ NA; 26 rows have NA) |
| **NA values in ANNUAL column**  | 26 (Andaman & Nicobar, Arunachal Pradesh, J&K, Lakshadweep, others) |
| **Duplicate records**           | 0 |
| **Missing value handling**      | NA cells parsed as null; excluded from all calculations |
| **Unit tests run**              | 20             |
| **Unit tests passed**           | 20 / 20 (100%) |
| **Test failures**               | 0              |
| **Frontend build status**       | ✓ Success (Vite production build) |
| **Backend build status**        | ✓ Success (Maven package) |
| **API response time (local)**   | < 50 ms for all endpoints |
| **CSV import success rate**     | 100% of well-formed rows |

### Unit Test Coverage (StatisticsServiceTest)

Test cases verified against reference observations [10, 20, 30]:

| Test | Expected | Status |
|------|----------|--------|
| Mean | 20.0 | ✓ |
| Median | 20.0 | ✓ |
| Median (even n: [10,20,30,40]) | 25.0 | ✓ |
| Min | 10.0 | ✓ |
| Max | 30.0 | ✓ |
| Range | 20.0 | ✓ |
| Population Variance | 200/3 ≈ 66.6667 | ✓ |
| Standard Deviation | √(200/3) ≈ 8.1650 | ✓ |
| Coefficient of Variation | ≈ 40.82% | ✓ |
| Percentage change (30 from 20) | +50.0% | ✓ |
| Percentage change (zero denominator) | null | ✓ |
| Percentage change (null input) | null | ✓ |
| Deviation from mean | +25.0% | ✓ |
| Deviation (zero mean) | null | ✓ |
| Seasonal contribution | 25.0% | ✓ |
| Seasonal contribution (null annual) | null | ✓ |
| Filter non-null | 3 values | ✓ |
| Empty list | 0.0 for all | ✓ |
| Single element | correct values | ✓ |
| Round | π → 3.14 | ✓ |

---

## 10. Results / Visualisations

The application renders the following data-driven visualisations, all computed from real IMD dataset values:

### Dashboard
- **KPI Cards:** Mean annual rainfall across all subdivision-year observations = **1,411.01 mm** (this is the arithmetic mean of 4,090 valid subdivision-year ANNUAL values; it is not a population-weighted or area-weighted national average). Highest subdivision-year annual = 6,331.1 mm; lowest = 62.3 mm. Std deviation = 903.74 mm. Date range and record count also displayed.
- **Yearly Trend Chart:** Area chart showing mean annual rainfall per year (averaged across all subdivisions present in that year), 1901–2015.
- **Seasonal Distribution:** Progress bars showing average seasonal rainfall and % contribution. The SW Monsoon (Jun–Sep) contributes ~75.2% of the annual total across all subdivision-year observations.
- **Monthly Distribution:** Bar chart showing June–September as the dominant rainfall months.

### Rainfall Analysis
- Annual trend line chart with dashed historical mean reference line.
- Year-over-year change bar chart (positive = wetter than previous year, negative = drier).
- Year comparison tool: users select any two years and see rainfall values, deviation from the historical mean, and absolute/relative difference.

### Seasonal Analysis
- Seasonal bar chart comparing the four IMD seasons.
- Radar chart visualising the relative shape of the seasonal distribution.
- Stacked year-by-year bar chart showing each season's contribution per year.

### Statistics Page
- All eight statistical measures displayed with their formulas and plain-language explanations.

### Data Explorer
- Paginated table of all 4,116 records with all 18 columns; sortable by year, annual rainfall, and subdivision; CSV export of current page.

> **Note:** Results described above are based on the actual IMD dataset. Specific numerical values reflect the complete 1901–2015 dataset with no filters applied. Values will change when year-range or subdivision filters are applied by the user.

---

## 11. References

1. India Meteorological Department — Open Government Data Platform India.
   *Rainfall in India.*
   https://www.data.gov.in/catalog/rainfall-india

2. National Data Sharing and Accessibility Policy (NDSAP).
   Government of India, Ministry of Electronics & IT.
   https://data.gov.in/sites/default/files/NDSAP.pdf

3. Spring Boot Reference Documentation (v3.3).
   https://docs.spring.io/spring-boot/docs/3.3.4/reference/html/

4. Apache Commons CSV User Guide.
   https://commons.apache.org/proper/commons-csv/

5. Recharts — Redefined Chart Library Built with React and D3.
   https://recharts.org/en-US/

6. React Router v6 Documentation.
   https://reactrouter.com/en/main

7. Tailwind CSS Documentation.
   https://tailwindcss.com/docs

8. JUnit 5 User Guide.
   https://junit.org/junit5/docs/current/user-guide/
