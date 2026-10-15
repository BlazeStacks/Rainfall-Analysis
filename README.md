# Rainfall Variation and Seasonal Patterns

A full-stack data analytics web application that visualises **115 years of Indian rainfall data (1901–2015)** from 36 IMD meteorological subdivisions.

Built as a college mini-project for the *Mathematical Foundation for GenAI* subject.

---

## Features

| Category            | Description |
|---------------------|-------------|
| **Dashboard**       | KPI cards, yearly trend chart, monthly distribution, seasonal breakdown |
| **Rainfall Analysis** | Annual trend with mean reference, YoY change chart, year comparison tool |
| **Seasonal Analysis** | Season info cards, bar chart, radar chart, stacked year-by-year breakdown |
| **Statistics**      | Mean, median, min, max, range, variance, std dev, CV with formulas |
| **Data Explorer**   | Sortable/paginated table, filters, CSV export |
| **About**           | Methodology, formulas, dataset source, technology stack |

---

## Technology Stack

### Frontend
- **React 18** + **Vite 6** (build tool)
- **Tailwind CSS 3** (styling)
- **React Router 6** (routing)
- **Recharts** (charts)
- **Lucide React** (icons)

### Backend
- **Java 21** + **Spring Boot 3.3**
- **Apache Commons CSV** (data loading)
- **Maven 3.9** (build)
- **JUnit 5** (testing)

### Database
- **No database required** — data is loaded from CSV into memory at startup.
- PostgreSQL can be added later if persistence is needed.

---

## Dataset

- **Source:** India Meteorological Department (IMD) via [data.gov.in](https://www.data.gov.in/catalog/rainfall-india)
- **Coverage:** 36 IMD subdivisions, 1901–2015
- **Format:** CSV, 4,116 rows, 18 columns
- **Unit:** Millimetres (mm)
- **License:** NDSAP (open government data)

See [DATASET.md](DATASET.md) for full documentation.

---

## Project Structure

```
project-root/
├── frontend/               # React + Vite application
│   ├── src/
│   │   ├── components/     # Sidebar, FilterBar, StatusComponents
│   │   ├── pages/          # Dashboard, RainfallAnalysis, SeasonalAnalysis, StatisticsPage, DataExplorer, About
│   │   ├── services/       # api.js (all HTTP calls)
│   │   ├── hooks/          # useApi.js
│   │   ├── utils/          # format.js
│   │   ├── App.jsx         # Router + layout
│   │   └── main.jsx        # Entry point
│   └── package.json
│
├── backend/
│   └── rainfall-api/       # Spring Boot application
│       └── src/main/java/com/rainfall/api/
│           ├── controller/     # RainfallController
│           ├── service/        # RainfallService, StatisticsService, DataLoaderService
│           ├── model/          # RainfallRecord
│           └── config/         # CorsConfig, GlobalExceptionHandler
│
├── data/
│   └── rainfall_india_1901_2015.csv    # Real IMD dataset
│
├── README.md
├── DATASET.md
├── PROJECT_REPORT.md
└── .env.example
```

---

## Prerequisites

Install these before running the project:

| Tool         | Version      | Download |
|--------------|--------------|----------|
| Node.js      | 18 or later  | https://nodejs.org |
| Java JDK     | 17 or later  | https://adoptium.net |
| Apache Maven | 3.8+         | https://maven.apache.org |

**Verified environment:** Node 24.14, Java 21, Maven 3.9.12, Windows 11.

---

## Installation & Running

### 1 — Clone / Download the project

Place the project folder at a convenient location (e.g. `C:\Projects\rainfall-project`).

### 2 — Start the Backend

Open a terminal in VS Code (`Ctrl + ~`):

```powershell
# Navigate to the backend
cd backend\rainfall-api

# Run the Spring Boot application
mvn spring-boot:run
```

The API starts at **http://localhost:8080**.

You should see:

```
INFO  c.r.api.service.DataLoaderService : Loaded 4116 rainfall records.
INFO  org.springframework.boot.web.embedded.tomcat.TomcatWebServer : Tomcat started on port 8080
```

### 3 — Start the Frontend

Open a **second** terminal:

```powershell
# Navigate to frontend
cd frontend

# Install dependencies (first time only)
npm install

# Start development server
npm run dev
```

The app opens at **http://localhost:5173**.

### 4 — Open in browser

Navigate to: **http://localhost:5173**

---

## Dataset Location

The CSV is bundled inside the backend jar (classpath).

The `DataLoaderService` also searches these external paths at startup:

1. `data/rainfall_india_1901_2015.csv` (relative to working directory)
2. `../data/rainfall_india_1901_2015.csv`
3. `../../data/rainfall_india_1901_2015.csv`

If the classpath resource is found, no external file is needed.

---

## API Endpoints

All endpoints are at `http://localhost:8080/api/rainfall`.

| Method | Endpoint              | Description |
|--------|-----------------------|-------------|
| GET    | `/metadata`           | Dataset metadata, column list, seasons |
| GET    | `/summary`            | KPI summary (mean, min, max, std dev) |
| GET    | `/yearly`             | Yearly rainfall averages with YoY change |
| GET    | `/monthly`            | Monthly rainfall averages |
| GET    | `/seasonal`           | Seasonal averages and contributions |
| GET    | `/seasonal/yearly`    | Season breakdown per year |
| GET    | `/statistics`         | Mean, median, variance, std dev, CV |
| GET    | `/records`            | Paginated raw records |
| GET    | `/subdivisions`       | List of all 36 subdivisions |
| GET    | `/compare`            | Compare two years |
| GET    | `/map-data`           | Per-subdivision rainfall for choropleth map (`year`, `field` required) |

### Common Query Parameters

| Parameter   | Type    | Description |
|-------------|---------|-------------|
| startYear   | integer | Filter from this year (inclusive) |
| endYear     | integer | Filter to this year (inclusive) |
| subdivision | string  | Filter by IMD subdivision name |
| page        | integer | Page index (0-based, for /records) |
| size        | integer | Records per page (max 500) |
| sortBy      | string  | `year`, `annual`, `subdivision` |
| ascending   | boolean | Sort direction |

---

## Running Tests

```powershell
cd backend\rainfall-api
mvn test
```

**20 unit tests** cover all statistical calculations:
- Mean, median, min, max, range
- Population variance and standard deviation
- Coefficient of variation
- Percentage change (including zero/null denominators)
- Deviation from mean
- Seasonal contribution
- Edge cases: empty list, single element, null filtering

---

## Environment Configuration

See [.env.example](.env.example) for available environment variables.

Create a `.env` file in `frontend/` to override the API URL:

```env
VITE_API_URL=http://localhost:8080/api/rainfall
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Backend won't start | Confirm Java 17+ is installed: `java --version` |
| "Loaded 0 records" | Verify CSV is in `data/` or inside the JAR's classpath resources |
| Frontend can't reach backend | Ensure backend is running on port 8080; CORS is configured for port 5173 |
| Port 8080 in use | Add `server.port=8081` to `backend/rainfall-api/src/main/resources/application.properties` and update `VITE_API_URL` |
| Maven download slow | First build downloads dependencies (~100 MB); subsequent builds are fast |

---

## Building for Production

```powershell
# Build backend JAR
cd backend\rainfall-api
mvn package -DskipTests

# Build frontend
cd ..\..\frontend
npm run build
# Output: frontend/dist/
```

## Deploying the Backend to Render

Create a **Web Service** in Render connected to this repository and configure:

- **Root Directory:** `backend/rainfall-api`
- **Runtime:** Docker
- **Dockerfile Path:** `./Dockerfile`

The Docker image builds the Spring Boot JAR and runs it using Render's `PORT` environment variable (defaulting to `8080` locally). The CSV dataset is packaged in the JAR. Once deployed, the API base URL is `https://<your-service>.onrender.com/api/rainfall`.

Set `CORS_ALLOWED_ORIGINS` in Render to the frontend's full origin (for example, `https://your-frontend.onrender.com`). For multiple origins, separate them with commas. The local Vite origins are allowed by default.
