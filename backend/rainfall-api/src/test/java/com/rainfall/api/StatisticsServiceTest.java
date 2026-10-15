package com.rainfall.api;

import com.rainfall.api.service.StatisticsService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for StatisticsService.
 *
 * Reference observations used throughout: [10, 20, 30]
 *
 * Expected values:
 *  Mean              = 20.0
 *  Median            = 20.0
 *  Min               = 10.0
 *  Max               = 30.0
 *  Range             = 20.0
 *  Population var    = 200/3 ≈ 66.6667
 *  Population std    = √(200/3) ≈ 8.1650
 *  CV                = (std / mean) * 100 ≈ 40.8248 %
 */
class StatisticsServiceTest {

    private StatisticsService stats;

    @BeforeEach
    void setUp() {
        stats = new StatisticsService();
    }

    private static final List<Double> SAMPLE = List.of(10.0, 20.0, 30.0);
    private static final double DELTA = 1e-4;

    @Test
    void testMean() {
        assertEquals(20.0, stats.mean(SAMPLE), DELTA, "Mean should be 20");
    }

    @Test
    void testMedian() {
        assertEquals(20.0, stats.median(SAMPLE), DELTA, "Median should be 20");
    }

    @Test
    void testMedianEvenCount() {
        // [10, 20, 30, 40] → median = (20+30)/2 = 25
        assertEquals(25.0, stats.median(List.of(10.0, 20.0, 30.0, 40.0)), DELTA);
    }

    @Test
    void testMin() {
        assertEquals(10.0, stats.min(SAMPLE), DELTA);
    }

    @Test
    void testMax() {
        assertEquals(30.0, stats.max(SAMPLE), DELTA);
    }

    @Test
    void testRange() {
        assertEquals(20.0, stats.range(SAMPLE), DELTA);
    }

    @Test
    void testPopulationVariance() {
        // σ² = ( (10-20)² + (20-20)² + (30-20)² ) / 3 = (100+0+100)/3 = 200/3
        double expected = 200.0 / 3.0;
        assertEquals(expected, stats.variance(SAMPLE), DELTA);
    }

    @Test
    void testStandardDeviation() {
        double expected = Math.sqrt(200.0 / 3.0);
        assertEquals(expected, stats.standardDeviation(SAMPLE), DELTA);
    }

    @Test
    void testCoefficientOfVariation() {
        double std = Math.sqrt(200.0 / 3.0);
        double expected = (std / 20.0) * 100.0;
        assertEquals(expected, stats.coefficientOfVariation(SAMPLE), DELTA);
    }

    @Test
    void testPercentageChange() {
        // (30 - 20) / 20 * 100 = 50%
        Double result = stats.percentageChange(30.0, 20.0);
        assertNotNull(result);
        assertEquals(50.0, result, DELTA);
    }

    @Test
    void testPercentageChangeZeroDenominator() {
        assertNull(stats.percentageChange(30.0, 0.0),
                "Should return null when previous value is zero");
    }

    @Test
    void testPercentageChangeNullInput() {
        assertNull(stats.percentageChange(null, 20.0),
                "Should return null when current value is null");
    }

    @Test
    void testDeviationFromMean() {
        // value=25, mean=20 → (25-20)/20*100 = 25%
        Double dev = stats.deviationFromMean(25.0, 20.0);
        assertNotNull(dev);
        assertEquals(25.0, dev, DELTA);
    }

    @Test
    void testDeviationFromMeanZero() {
        assertNull(stats.deviationFromMean(25.0, 0.0),
                "Should return null when mean is zero");
    }

    @Test
    void testSeasonalContribution() {
        // seasonal=300, annual=1200 → 25%
        Double contrib = stats.seasonalContribution(300.0, 1200.0);
        assertNotNull(contrib);
        assertEquals(25.0, contrib, DELTA);
    }

    @Test
    void testSeasonalContributionNullAnnual() {
        assertNull(stats.seasonalContribution(300.0, null));
    }

    @Test
    void testFilterNonNull() {
        List<Double> mixed = List.of(1.0, 2.0, 3.0);
        List<Double> result = stats.filterNonNull(mixed);
        assertEquals(3, result.size());
    }

    @Test
    void testEmptyList() {
        List<Double> empty = List.of();
        assertEquals(0.0, stats.mean(empty));
        assertEquals(0.0, stats.median(empty));
        assertEquals(0.0, stats.variance(empty));
        assertEquals(0.0, stats.standardDeviation(empty));
    }

    @Test
    void testSingleElement() {
        List<Double> single = List.of(42.0);
        assertEquals(42.0, stats.mean(single), DELTA);
        assertEquals(42.0, stats.median(single), DELTA);
        assertEquals(42.0, stats.min(single), DELTA);
        assertEquals(42.0, stats.max(single), DELTA);
        assertEquals(0.0,  stats.range(single), DELTA);
    }

    @Test
    void testRound() {
        assertEquals(3.14, stats.round(Math.PI, 2), DELTA);
    }
}
