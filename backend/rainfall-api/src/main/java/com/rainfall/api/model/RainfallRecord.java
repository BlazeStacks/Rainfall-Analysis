package com.rainfall.api.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Represents a single row from the rainfall CSV dataset.
 * Columns: SUBDIVISION, YEAR, JAN..DEC, ANNUAL, Jan-Feb, Mar-May, Jun-Sep, Oct-Dec
 * All rainfall values are in millimetres (mm).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RainfallRecord {

    private String subdivision;
    private int year;

    // Monthly rainfall in mm
    private Double jan;
    private Double feb;
    private Double mar;
    private Double apr;
    private Double may;
    private Double jun;
    private Double jul;
    private Double aug;
    private Double sep;
    private Double oct;
    private Double nov;
    private Double dec;

    // Annual total in mm
    private Double annual;

    // Seasonal totals pre-computed in the dataset (used for verification)
    // Jan-Feb  = Winter season
    private Double janFeb;
    // Mar-May  = Pre-monsoon / Summer
    private Double marMay;
    // Jun-Sep  = South-west monsoon
    private Double junSep;
    // Oct-Dec  = Post-monsoon / North-east monsoon
    private Double octDec;

    /**
     * Returns true if the annual rainfall value is available (not null).
     */
    public boolean hasAnnual() {
        return annual != null;
    }
}
