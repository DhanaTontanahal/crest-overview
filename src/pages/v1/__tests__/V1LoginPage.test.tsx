import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import V1LoginPage from "../V1LoginPage";

// Mock MindMap since it's complex
vi.mock("@/components/MindMap", () => ({
  default: () => <div data-testid="mind-map">MindMap</div>,
}));

describe("V1LoginPage", () => {
  const mockOnLogin = vi.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
  });

  it("renders the page title", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByText("Platform 4.0 Maturity Measurement")).toBeInTheDocument();
  });

  it("does not render old v0 badge text", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    expect(screen.queryByText("v0 — 3-Role Model")).not.toBeInTheDocument();
  });

  it("does not render the old v1 link text", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    expect(screen.queryByText(/Need the full 5-role experience/)).not.toBeInTheDocument();
  });

  it("renders the role selection form", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByText("Select Role")).toBeInTheDocument();
    expect(screen.getByLabelText("Sign in with selected role")).toBeInTheDocument();
  });

  it("sign in button is disabled when no role is selected", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    const signInBtn = screen.getByLabelText("Sign in with selected role");
    expect(signInBtn).toBeDisabled();
  });

  it("renders the landing carousel slides", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByText("Framework at a Glance")).toBeInTheDocument();
    expect(screen.getByText("Maturity Framework")).toBeInTheDocument();
    expect(screen.getByText("Assessment to Metrics")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<V1LoginPage onLogin={mockOnLogin} />);
    expect(screen.getByText(/A unified framework ensuring consistent understanding/)).toBeInTheDocument();
  });
});
