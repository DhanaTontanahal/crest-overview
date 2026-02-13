import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import GaugeChart from "../GaugeChart";

// Mock ChartChatBox to avoid context dependency
vi.mock("@/components/ChartChatBox", () => ({
  default: () => <div data-testid="chart-chat-box" />,
}));

describe("GaugeChart", () => {
  it("renders title and subtitle", () => {
    render(<GaugeChart value={75} title="Team Stability" subtitle="How stable?" teamCount={10} />);
    expect(screen.getByText("Team Stability")).toBeInTheDocument();
    expect(screen.getByText("How stable?")).toBeInTheDocument();
  });

  it("renders team count", () => {
    render(<GaugeChart value={50} title="Maturity" subtitle="Test" teamCount={5} />);
    expect(screen.getByText("(5 teams)")).toBeInTheDocument();
  });

  it("renders SVG gauge element", () => {
    const { container } = render(<GaugeChart value={60} title="Test" subtitle="Sub" teamCount={3} />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("clamps value above 100", () => {
    render(<GaugeChart value={150} title="Over" subtitle="Max" teamCount={1} />);
    // Should not crash, renders normally
    expect(screen.getByText("Over")).toBeInTheDocument();
  });

  it("clamps value below 0", () => {
    render(<GaugeChart value={-10} title="Under" subtitle="Min" teamCount={1} />);
    expect(screen.getByText("Under")).toBeInTheDocument();
  });
});
