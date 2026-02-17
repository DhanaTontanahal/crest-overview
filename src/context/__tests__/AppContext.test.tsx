import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppProvider, useAppState } from "../AppContext";

const TestConsumer = () => {
  const state = useAppState();
  return (
    <div>
      <span data-testid="role">{state.role}</span>
      <span data-testid="platform">{state.selectedPlatform}</span>
      <span data-testid="pillar">{state.selectedPillar}</span>
      <span data-testid="teams-count">{state.teams.length}</span>
      <span data-testid="calc-method">{state.calculationMethod}</span>
      <span data-testid="questions-count">{state.assessmentQuestions.length}</span>
      <span data-testid="assessments-count">{state.assessments.length}</span>
    </div>
  );
};

describe("AppContext", () => {
  it("provides default state values", () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId("role").textContent).toBe("user");
    expect(screen.getByTestId("platform").textContent).toBe("All");
    expect(screen.getByTestId("pillar").textContent).toBe("All");
  });

  it("provides teams data", () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    const count = Number(screen.getByTestId("teams-count").textContent);
    expect(count).toBeGreaterThan(0);
  });

  it("provides default calculation method as simple", () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    expect(screen.getByTestId("calc-method").textContent).toBe("simple");
  });

  it("provides assessment questions", () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    const count = Number(screen.getByTestId("questions-count").textContent);
    expect(count).toBeGreaterThan(0);
  });

  it("provides sample assessments", () => {
    render(
      <AppProvider>
        <TestConsumer />
      </AppProvider>
    );
    const count = Number(screen.getByTestId("assessments-count").textContent);
    expect(count).toBeGreaterThan(0);
  });

  it("throws when used outside provider", () => {
    expect(() => render(<TestConsumer />)).toThrow("useAppState must be used within AppProvider");
  });
});
