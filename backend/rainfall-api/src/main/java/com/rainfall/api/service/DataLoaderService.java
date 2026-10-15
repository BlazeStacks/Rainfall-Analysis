package com.rainfall.api.service;

import com.rainfall.api.model.RainfallRecord;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Loads and caches the rainfall CSV dataset into memory at application startup.
 * The CSV is read from the classpath (resources/data/rainfall_india_1901_2015.csv)
 * or from a configurable external path.
 *
 * No database is required – all data is held in an in-memory list.
 * This keeps setup simple for a college project environment.
 */
@Slf4j
@Service
public class DataLoaderService {

    private final List<RainfallRecord> records = new ArrayList<>();

    @PostConstruct
    public void load() {
        try {
            Reader reader = resolveReader();
            CSVFormat format = CSVFormat.DEFAULT
                    .builder()
                    .setHeader()
                    .setSkipHeaderRecord(true)
                    .setTrim(true)
                    .setIgnoreEmptyLines(true)
                    .build();

            try (CSVParser parser = new CSVParser(reader, format)) {
                for (CSVRecord row : parser) {
                    try {
                        RainfallRecord rec = parseRow(row);
                        records.add(rec);
                    } catch (Exception e) {
                        log.warn("Skipping malformed row {}: {}", parser.getCurrentLineNumber(), e.getMessage());
                    }
                }
            }
            log.info("Loaded {} rainfall records.", records.size());
        } catch (Exception e) {
            log.error("Failed to load rainfall dataset: {}", e.getMessage());
        }
    }

    /** Returns an unmodifiable view of all loaded records. */
    public List<RainfallRecord> getAllRecords() {
        return Collections.unmodifiableList(records);
    }

    public int getRecordCount() {
        return records.size();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Tries to locate the CSV in the following order:
     * 1. External file: ../../data/rainfall_india_1901_2015.csv (relative to jar)
     * 2. Classpath: /data/rainfall_india_1901_2015.csv
     */
    private Reader resolveReader() throws Exception {
        String[] externalPaths = {
            "data/rainfall_india_1901_2015.csv",
            "../data/rainfall_india_1901_2015.csv",
            "../../data/rainfall_india_1901_2015.csv"
        };

        for (String p : externalPaths) {
            Path path = Paths.get(p).toAbsolutePath();
            if (Files.exists(path)) {
                log.info("Loading dataset from external path: {}", path);
                return Files.newBufferedReader(path, StandardCharsets.UTF_8);
            }
        }

        var stream = getClass().getResourceAsStream("/data/rainfall_india_1901_2015.csv");
        if (stream != null) {
            log.info("Loading dataset from classpath resources.");
            return new InputStreamReader(stream, StandardCharsets.UTF_8);
        }

        throw new IllegalStateException(
            "Rainfall CSV not found. Place rainfall_india_1901_2015.csv in the project's data/ directory.");
    }

    private RainfallRecord parseRow(CSVRecord row) {
        return RainfallRecord.builder()
                .subdivision(row.get("SUBDIVISION").trim())
                .year(Integer.parseInt(row.get("YEAR").trim()))
                .jan(parseDouble(row, "JAN"))
                .feb(parseDouble(row, "FEB"))
                .mar(parseDouble(row, "MAR"))
                .apr(parseDouble(row, "APR"))
                .may(parseDouble(row, "MAY"))
                .jun(parseDouble(row, "JUN"))
                .jul(parseDouble(row, "JUL"))
                .aug(parseDouble(row, "AUG"))
                .sep(parseDouble(row, "SEP"))
                .oct(parseDouble(row, "OCT"))
                .nov(parseDouble(row, "NOV"))
                .dec(parseDouble(row, "DEC"))
                .annual(parseDouble(row, "ANNUAL"))
                .janFeb(parseDouble(row, "Jan-Feb"))
                .marMay(parseDouble(row, "Mar-May"))
                .junSep(parseDouble(row, "Jun-Sep"))
                .octDec(parseDouble(row, "Oct-Dec"))
                .build();
    }

    /**
     * Parses a double from a CSV cell.
     * Returns null for empty, "NA", or non-numeric values.
     */
    private Double parseDouble(CSVRecord row, String column) {
        try {
            String val = row.get(column).trim();
            if (val.isEmpty() || val.equalsIgnoreCase("NA") || val.equals("-")) {
                return null;
            }
            return Double.parseDouble(val);
        } catch (Exception e) {
            return null;
        }
    }
}
