# MAP_DATA.md — Geographical Boundary Data

## Source

**Provider:** India Meteorological Department (IMD)  
**URL:** https://mausam.imd.gov.in/imd_latest/contents/district_shapefiles/sd_boundary.json  
**Format:** GeoJSON FeatureCollection  
**Original CRS:** EPSG:32644 (WGS 84 / UTM Zone 44N — metres)  
**Stored CRS:** WGS84 (EPSG:4326, degrees) — reprojected from the original using `proj4` (see `frontend/scripts/reproject_geojson.mjs`)  
**Features:** 36 (one per IMD meteorological subdivision)  
**Downloaded:** 2025 (reprojected copy bundled at `frontend/public/imd_subdivisions.geojson`)

## GeoJSON Properties

Each feature has the following properties:

| Property     | Description                              |
|--------------|------------------------------------------|
| `OBJECTID_1` | IMD internal numeric ID                  |
| `region_cod` | IMD region name (e.g. SOUTH PENINSULA)   |
| `subdivisio` | **IMD subdivision name** — primary key   |
| `STATE`      | Associated state name                    |
| `Area`       | Area in sq km                            |

The `subdivisio` field is the primary matching key used by the application.

## Name Mapping: GeoJSON → Dataset

27 of 36 subdivision names match the dataset exactly (case-insensitive).  
The following 9 require explicit mapping:

| GeoJSON `subdivisio`       | Dataset `SUBDIVISION`                  | Reason                         |
|----------------------------|----------------------------------------|--------------------------------|
| `A & N ISLAND`             | `ANDAMAN & NICOBAR ISLANDS`            | Abbreviated in GeoJSON         |
| `HAR. CHD & DELHI`         | `HARYANA DELHI & CHANDIGARH`           | Abbreviated                    |
| `MARATHWADA`               | `MATATHWADA`                           | Different transliteration      |
| `N M M T`                  | `NAGA MANI MIZO TRIPURA`               | Initialism in GeoJSON          |
| `N. I. KARNATAKA`          | `NORTH INTERIOR KARNATAKA`             | Abbreviated                    |
| `RAYALASEEMA`              | `RAYALSEEMA`                           | Extra 'A' in GeoJSON           |
| `S. I. KARNATAKA`          | `SOUTH INTERIOR KARNATAKA`             | Abbreviated                    |
| `SHWB & SIKKIM`            | `SUB HIMALAYAN WEST BENGAL & SIKKIM`   | Abbreviated                    |
| `TAMILNADU & PONDICHERY`   | `TAMIL NADU`                           | GeoJSON includes Pondicherry   |

Mapping is implemented in `frontend/src/components/RainfallMap.jsx` → `GEO_TO_DATA` constant.

## All 36 Matched Subdivisions

| # | GeoJSON Name               | Dataset Name                        | Match Type |
|---|----------------------------|-------------------------------------|------------|
| 1 | A & N ISLAND               | ANDAMAN & NICOBAR ISLANDS           | Mapped     |
| 2 | ARUNACHAL PRADESH          | ARUNACHAL PRADESH                   | Exact      |
| 3 | ASSAM & MEGHALAYA          | ASSAM & MEGHALAYA                   | Exact      |
| 4 | BIHAR                      | BIHAR                               | Exact      |
| 5 | CHHATTISGARH               | CHHATTISGARH                        | Exact      |
| 6 | COASTAL ANDHRA PRADESH     | COASTAL ANDHRA PRADESH              | Exact      |
| 7 | COASTAL KARNATAKA          | COASTAL KARNATAKA                   | Exact      |
| 8 | EAST MADHYA PRADESH        | EAST MADHYA PRADESH                 | Exact      |
| 9 | EAST RAJASTHAN             | EAST RAJASTHAN                      | Exact      |
| 10 | EAST UTTAR PRADESH        | EAST UTTAR PRADESH                  | Exact      |
| 11 | GANGETIC WEST BENGAL      | GANGETIC WEST BENGAL                | Exact      |
| 12 | GUJARAT REGION            | GUJARAT REGION                      | Exact      |
| 13 | HAR. CHD & DELHI          | HARYANA DELHI & CHANDIGARH          | Mapped     |
| 14 | HIMACHAL PRADESH          | HIMACHAL PRADESH                    | Exact      |
| 15 | JAMMU & KASHMIR           | JAMMU & KASHMIR                     | Exact      |
| 16 | JHARKHAND                 | JHARKHAND                           | Exact      |
| 17 | KERALA                    | KERALA                              | Exact      |
| 18 | KONKAN & GOA              | KONKAN & GOA                        | Exact      |
| 19 | LAKSHADWEEP               | LAKSHADWEEP                         | Exact      |
| 20 | MADHYA MAHARASHTRA        | MADHYA MAHARASHTRA                  | Exact      |
| 21 | MARATHWADA                | MATATHWADA                          | Mapped     |
| 22 | N M M T                   | NAGA MANI MIZO TRIPURA              | Mapped     |
| 23 | N. I. KARNATAKA           | NORTH INTERIOR KARNATAKA            | Mapped     |
| 24 | ORISSA                    | ORISSA                              | Exact      |
| 25 | PUNJAB                    | PUNJAB                              | Exact      |
| 26 | RAYALASEEMA               | RAYALSEEMA                          | Mapped     |
| 27 | S. I. KARNATAKA           | SOUTH INTERIOR KARNATAKA            | Mapped     |
| 28 | SAURASHTRA & KUTCH        | SAURASHTRA & KUTCH                  | Exact      |
| 29 | SHWB & SIKKIM             | SUB HIMALAYAN WEST BENGAL & SIKKIM  | Mapped     |
| 30 | TAMILNADU & PONDICHERY    | TAMIL NADU                          | Mapped     |
| 31 | TELANGANA                 | TELANGANA                           | Exact      |
| 32 | UTTARAKHAND               | UTTARAKHAND                         | Exact      |
| 33 | VIDARBHA                  | VIDARBHA                            | Exact      |
| 34 | WEST MADHYA PRADESH       | WEST MADHYA PRADESH                 | Exact      |
| 35 | WEST RAJASTHAN            | WEST RAJASTHAN                      | Exact      |
| 36 | WEST UTTAR PRADESH        | WEST UTTAR PRADESH                  | Exact      |

**Total matched: 36 / 36 (100%)**

## Colour Scale

The choropleth uses a YlGnBu (Yellow-Green-Blue) sequential palette:

| Colour     | Hex       | Annual threshold |
|------------|-----------|-----------------|
| Pale yellow | `#ffffcc` | < 300 mm        |
| Light green | `#c7e9b4` | 300–600 mm      |
| Teal        | `#7fcdbb` | 600–1,000 mm    |
| Cyan        | `#41b6c4` | 1,000–1,500 mm  |
| Steel blue  | `#1d91c0` | 1,500–2,200 mm  |
| Dark blue   | `#225ea8` | 2,200–3,500 mm  |
| Navy        | `#0c2c84` | > 3,500 mm      |
| Grey        | `#cbd5e1` | No data         |

**Annual breaks** are fixed based on India's actual rainfall distribution (arid Rajasthan ~62 mm to very wet NE India ~6,331 mm).

**Non-annual breaks** (monthly/seasonal) are computed dynamically from the **quantile distribution** of the selected year's values. This ensures colours are always spread across the visible range regardless of the magnitude of the selected period.

## Geographical Limitations

- **Lakshadweep** and **Andaman & Nicobar Islands** are small island territories that may not be visible at low zoom levels. Zoom in to see them.
- The GeoJSON uses simplified polygon boundaries suitable for overview visualization at zoom levels 3–8. Fine boundary details (e.g., enclaves) may not be perfectly represented.
- Pondicherry (now Puducherry) is included within the Tamil Nadu subdivision boundary in this dataset.
