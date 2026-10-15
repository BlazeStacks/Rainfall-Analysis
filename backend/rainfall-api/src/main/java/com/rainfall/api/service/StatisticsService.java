package com.rainfall.api.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

/**
 * Utility class that implements the core statistical calculations required by
 * the project.  Every method operates on a List<Double> of observations.
 *
 * Definitions used:
 *  - Mean        : arithmetic mean (sum / n)
 *  - Median      : middle value after sorting; average of two middle values for even n
 *  - Variance    : population variance = sum((xi - mean)^2) / n
 *  - Std Dev     : sqrt(population variance)
 *  - CV          : (std dev / mean) * 100   — undefined when mean == 0
 */
@Slf4j
@Component
public class StatisticsService {

    /**
     * Arithmetic mean.
     * Mean = Σxᵢ / n
     */
    public double mean(List<Double> values) {
        if (values == null || values.isEmpty()) return 0.0;
        double sum = 0.0;
        for (double v : values) sum += v;
        return sum / values.size();
    }

    /**
     * Median — middle value of the sorted dataset.
     * For even n: (x[n/2-1] + x[n/2]) / 2
     */
    public double median(List<Double> values) {
        if (values == null || values.isEmpty()) return 0.0;
        List<Double> sorted = new ArrayList<>(values);
        Collections.sort(sorted);
        int n = sorted.size();
        if (n % 2 == 1) {
            return sorted.get(n / 2);
        } else {
            return (sorted.get(n / 2 - 1) + sorted.get(n / 2)) / 2.0;
        }
    }

    /** Minimum value. */
    public double min(List<Double> values) {
        if (values == null || values.isEmpty()) return 0.0;
        return Collections.min(values);
    }

    /** Maximum value. */
    public double max(List<Double> values) {
        if (values == null || values.isEmpty()) return 0.0;
        return Collections.max(values);
    }

    /** Range = max − min */
    public double range(List<Double> values) {
        if (values == null || values.isEmpty()) return 0.0;
        return max(values) - min(values);
    }

    /**
     * Population variance.
     * σ² = Σ(xᵢ − μ)² / n
     *
     * We use population variance (dividing by n) because the dataset represents
     * the complete historical record, not a sample drawn for inference.
     */
    public double variance(List<Double> values) {
        if (values == null || values.size() < 2) return 0.0;
        double mu = mean(values);
        double sumSq = 0.0;
        for (double v : values) {
            double diff = v - mu;
            sumSq += diff * diff;
        }
        return sumSq / values.size();
    }

    /**
     * Population standard deviation.
     * σ = √σ²
     */
    public double standardDeviation(List<Double> values) {
        return Math.sqrt(variance(values));
    }

    /**
     * Coefficient of variation (%).
     * CV = (σ / μ) × 100
     * Returns 0 if mean is zero to avoid division by zero.
     */
    public double coefficientOfVariation(List<Double> values) {
        double mu = mean(values);
        if (mu == 0.0) return 0.0;
        return (standardDeviation(values) / mu) * 100.0;
    }

    /**
     * Year-to-year percentage change.
     * ((current − previous) / previous) × 100
     * Returns null when the previous value is zero or null.
     */
    public Double percentageChange(Double current, Double previous) {
        if (previous == null || previous == 0.0 || current == null) return null;
        return ((current - previous) / previous) * 100.0;
    }

    /**
     * How much does the value deviate from the historical mean (in %)?
     * ((value − mean) / mean) × 100
     */
    public Double deviationFromMean(double value, double mean) {
        if (mean == 0.0) return null;
        return ((value - mean) / mean) * 100.0;
    }

    /**
     * Seasonal contribution to annual rainfall (%).
     * (seasonal / annual) × 100
     */
    public Double seasonalContribution(Double seasonal, Double annual) {
        if (annual == null || annual == 0.0 || seasonal == null) return null;
        return (seasonal / annual) * 100.0;
    }

    /**
     * Round a double to a specified number of decimal places.
     */
    public double round(double value, int places) {
        double factor = Math.pow(10, places);
        return Math.round(value * factor) / factor;
    }

    /**
     * Filters out null values from a list, returning only valid observations.
     */
    public List<Double> filterNonNull(List<Double> values) {
        List<Double> result = new ArrayList<>();
        if (values == null) return result;
        for (Double v : values) {
            if (v != null) result.add(v);
        }
        return result;
    }
}
