import { describe, it, expect } from "vitest";
import {
  cios, defaultPlatforms, defaultPillars,
  dummyTeams, dummyMaturityDimensions, dummyPerformanceMetrics,
  dummyTimeSeries, quarterlyTrends, availableQuarters, currentQuarter,
} from "../dummyData";

describe("dummyData", () => {
  it("has 4 CIOs matching the 4 default platforms", () => {
    expect(cios).toHaveLength(4);
    cios.forEach(cio => {
      expect(defaultPlatforms).toContain(cio.platform);
    });
  });

  it("has 6 default pillars", () => {
    expect(defaultPillars).toHaveLength(6);
  });

  it("currentQuarter matches Q<n> <year> format", () => {
    expect(currentQuarter).toMatch(/^Q[1-4] \d{4}$/);
  });

  it("availableQuarters contains currentQuarter", () => {
    expect(availableQuarters).toContain(currentQuarter);
  });

  it("dummyTeams have valid structure", () => {
    expect(dummyTeams.length).toBeGreaterThan(0);
    dummyTeams.forEach(team => {
      expect(team).toHaveProperty("name");
      expect(team).toHaveProperty("maturity");
      expect(team).toHaveProperty("performance");
      expect(team).toHaveProperty("platform");
      expect(team).toHaveProperty("pillar");
      expect(team).toHaveProperty("quarter");
      expect(team.maturity).toBeGreaterThanOrEqual(0);
      expect(team.maturity).toBeLessThanOrEqual(10);
    });
  });

  it("maturity dimensions have scores and averages", () => {
    dummyMaturityDimensions.forEach(dim => {
      expect(dim.scores.length).toBeGreaterThan(0);
      expect(dim.average).toBeGreaterThanOrEqual(0);
    });
  });

  it("performance metrics have scores and averages", () => {
    dummyPerformanceMetrics.forEach(metric => {
      expect(metric.scores.length).toBeGreaterThan(0);
      expect(metric.average).toBeGreaterThanOrEqual(0);
    });
  });

  it("time series has sequential periods", () => {
    expect(dummyTimeSeries.length).toBeGreaterThan(0);
    dummyTimeSeries.forEach(point => {
      expect(point).toHaveProperty("period");
      expect(point).toHaveProperty("maturity");
      expect(point).toHaveProperty("performance");
    });
  });

  it("quarterly trends have required metrics", () => {
    quarterlyTrends.forEach(trend => {
      expect(trend).toHaveProperty("quarter");
      expect(trend).toHaveProperty("stability");
      expect(trend).toHaveProperty("maturity");
      expect(trend).toHaveProperty("performance");
      expect(trend).toHaveProperty("weightedAverage");
    });
  });
});
