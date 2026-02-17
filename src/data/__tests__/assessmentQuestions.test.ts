import { describe, it, expect } from "vitest";
import { assessmentQuestions, sampleAssessments } from "../assessmentQuestions";

describe("assessmentQuestions", () => {
  it("has questions for all 6 pillars", () => {
    const pillars = new Set(assessmentQuestions.map(q => q.pillar));
    expect(pillars.size).toBe(6);
  });

  it("each question has required fields", () => {
    assessmentQuestions.forEach(q => {
      expect(q.id).toBeTruthy();
      expect(q.pillar).toBeTruthy();
      expect(q.question).toBeTruthy();
      expect(q.lowMaturity).toBeTruthy();
      expect(q.highMaturity).toBeTruthy();
      expect(q.observableMetrics).toBeTruthy();
    });
  });

  it("question ids are unique", () => {
    const ids = assessmentQuestions.map(q => q.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("has at least 20 questions", () => {
    expect(assessmentQuestions.length).toBeGreaterThanOrEqual(20);
  });
});

describe("sampleAssessments", () => {
  it("has sample assessments", () => {
    expect(sampleAssessments.length).toBeGreaterThan(0);
  });

  it("each assessment has valid structure", () => {
    sampleAssessments.forEach(a => {
      expect(a.id).toBeTruthy();
      expect(a.platform).toBeTruthy();
      expect(a.quarter).toBeTruthy();
      expect(a.status).toMatch(/^(draft|submitted|reviewed)$/);
      expect(a.answers.length).toBeGreaterThan(0);
    });
  });

  it("assessment answers have valid scores (1-5)", () => {
    sampleAssessments.forEach(a => {
      a.answers.forEach(ans => {
        expect(ans.score).toBeGreaterThanOrEqual(1);
        expect(ans.score).toBeLessThanOrEqual(5);
      });
    });
  });
});
