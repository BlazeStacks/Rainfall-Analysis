# Dataset Documentation

## Dataset Name
Rainfall in India (1901–2015)

## Official Source
- **Catalog URL:** https://www.data.gov.in/catalog/rainfall-india
- **API:** https://www.data.gov.in/apis/fb5e2a33-3e34-4087-83a1-f0e46f2748d0
- **Contributor:** India Meteorological Department (IMD), Ministry of Earth Sciences
- **Platform:** Open Government Data (OGD) Platform India

## Download Information
- **Mirror used:** https://raw.githubusercontent.com/chandanverma07/DataSets/master/rainfall%20in%20india%201901-2015.csv
  - This GitHub mirror contains the same IMD data published on data.gov.in.
- **Original file name:** `rainfall in india 1901-2015.csv`
- **Saved as:** `data/rainfall_india_1901_2015.csv`
- **Download date:** October 2026
- **File format:** CSV (comma-separated values)

## License
National Data Sharing and Accessibility Policy (NDSAP)
- URL: https://data.gov.in/sites/default/files/NDSAP.pdf
- Data published by Government of India Ministries and Departments is open for use.

## Dataset Statistics
- **Number of rows (records):** 4,116 (verified: `(Get-Content rainfall_india_1901_2015.csv | Measure-Object -Line).Lines` = 4117, minus 1 header = 4116)
- **Number of columns:** 18
- **Geographic coverage:** 36 IMD meteorological subdivisions across India
- **Temporal coverage:** 1901–2015 (115 years)

## Column Descriptions

| Column     | Description                                      | Unit |
|------------|--------------------------------------------------|------|
| SUBDIVISION| IMD meteorological subdivision name             | —    |
| YEAR       | Calendar year                                    | —    |
| JAN        | Rainfall in January                              | mm   |
| FEB        | Rainfall in February                             | mm   |
| MAR        | Rainfall in March                                | mm   |
| APR        | Rainfall in April                                | mm   |
| MAY        | Rainfall in May                                  | mm   |
| JUN        | Rainfall in June                                 | mm   |
| JUL        | Rainfall in July                                 | mm   |
| AUG        | Rainfall in August                               | mm   |
| SEP        | Rainfall in September                            | mm   |
| OCT        | Rainfall in October                              | mm   |
| NOV        | Rainfall in November                             | mm   |
| DEC        | Rainfall in December                             | mm   |
| ANNUAL     | Total annual rainfall (sum of monthly values)   | mm   |
| Jan-Feb    | Winter season total                              | mm   |
| Mar-May    | Pre-monsoon season total                         | mm   |
| Jun-Sep    | South-west monsoon season total                  | mm   |
| Oct-Dec    | Post-monsoon season total                        | mm   |

## Units
All rainfall values are in **millimetres (mm)**.

## Missing Value Handling
- Missing values are represented as the string `NA` in the CSV (not empty cells).
- **ANNUAL column:** 26 rows have `NA` (affected subdivisions: Andaman & Nicobar Islands ×6, Arunachal Pradesh ×6, Lakshadweep ×10, Jammu & Kashmir ×1, West Madhya Pradesh ×1, Coastal Karnataka ×1, Matathwada ×1).
- **Monthly columns:** Additional NA values exist in individual month columns (JAN–DEC range: 3–11 NAs per column).
- **Duplicate records:** None — all SUBDIVISION + YEAR combinations are unique.
- The application's `parseDouble()` method handles `NA` strings by returning `null`.
- `null` values are excluded from all statistical calculations via `filterNonNull()`.
- Rows with NA in a specific month are excluded only from that month's calculation; the row itself is not dropped.

## Transformations Performed
1. CSV loaded into memory at application startup using Apache Commons CSV.
2. Column `Jan-Feb` mapped to field `janFeb`, `Mar-May` → `marMay`, `Jun-Sep` → `junSep`, `Oct-Dec` → `octDec`.
3. Empty/NA cells parsed as `null` (not zero) to avoid distorting statistics.
4. No data values were modified, imputed, or fabricated.

## IMD Meteorological Subdivisions (36 total)
Andaman & Nicobar Islands, Arunachal Pradesh, Assam & Meghalaya, Bihar, Chhattisgarh,
Coastal Andhra Pradesh, Coastal Karnataka, East Madhya Pradesh, East Rajasthan,
East Uttar Pradesh, Gangetic West Bengal, Gujarat Region, Haryana Delhi & Chandigarh,
Himachal Pradesh, Interior Karnataka, Jammu & Kashmir, Jharkhand, Kerala,
Konkan & Goa, Lakshadweep, Marathwada, Matathwada, Naga Mani Mizo Tripura,
North Interior Karnataka, Orissa, Punjab, Rayalaseema, Saurashtra & Kutch,
Shwh Maharashra, Sikkim, South Interior Karnataka, Sub Himalayan West Bengal & Sikkim,
Tamil Nadu, Telangana, Uttarakhand, Vidarbha, West Madhya Pradesh, West Rajasthan,
West Uttar Pradesh.

## Season Definitions Used
| Season           | Months                   |
|------------------|--------------------------|
| Winter           | January, February        |
| Pre-Monsoon      | March, April, May        |
| South-West Monsoon| June, July, August, September |
| Post-Monsoon     | October, November, December |
