import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import ActionItems from "../ActionItems";

// Mock AppContext
const mockAppState = {
  teams: [
    { name: "T1", maturity: 3, performance: 4, agility: 3, stability: 40, platform: "Consumer", pillar: "Engineering Excellence", quarter: "Q1 2026" },
  ],
  selectedQuarter: "Q1 2026",
  pillars: ["Engineering Excellence", "Run and Change Together"],
  platforms: ["Consumer", "Commercial"],
};

vi.mock("@/context/AppContext", () => ({
  useAppState: () => mockAppState,
}));

vi.mock("@/components/ChartChatBox", () => ({
  default: () => <div data-testid="chart-chat-box" />,
}));

describe("ActionItems", () => {
  it("renders the heading", () => {
    render(<ActionItems />);
    expect(screen.getByText("Action Items for Improvement")).toBeInTheDocument();
  });

  it("shows auto-generated suggestions for low scores", () => {
    render(<ActionItems />);
    // Low maturity (3) should generate a suggestion
    expect(screen.getByText(/Maturity score is low/)).toBeInTheDocument();
  });

  it("shows Add Item button", () => {
    render(<ActionItems />);
    expect(screen.getByText("Add Item")).toBeInTheDocument();
  });

  it("toggles add form on button click", () => {
    render(<ActionItems />);
    fireEvent.click(screen.getByText("Add Item"));
    expect(screen.getByPlaceholderText("Describe the action item...")).toBeInTheDocument();
  });

  it("filters by platformFilter prop", () => {
    render(<ActionItems platformFilter="Consumer" />);
    // Should still render suggestions for Consumer only
    expect(screen.getByText(/Maturity score is low/)).toBeInTheDocument();
  });
});
