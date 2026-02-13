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

  it("throws when used outside provider", () => {
    expect(() => render(<TestConsumer />)).toThrow("useAppState must be used within AppProvider");
  });
});
