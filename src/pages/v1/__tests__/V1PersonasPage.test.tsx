import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import V1PersonasPage from "../V1PersonasPage";

describe("V1PersonasPage", () => {
  it("renders all three persona cards", () => {
    render(<V1PersonasPage />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Peer Reviewer")).toBeInTheDocument();
  });

  it("renders persona descriptions", () => {
    render(<V1PersonasPage />);
    expect(screen.getByText(/Create and manage assessments/)).toBeInTheDocument();
    expect(screen.getByText(/Complete self-assessments/)).toBeInTheDocument();
    expect(screen.getByText(/Review and calibrate/)).toBeInTheDocument();
  });

  it("renders with accessible list structure", () => {
    render(<V1PersonasPage />);
    const list = screen.getByRole("list");
    expect(list).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
  });

  it("renders aria labels on persona cards", () => {
    render(<V1PersonasPage />);
    expect(screen.getByLabelText("Admin persona")).toBeInTheDocument();
    expect(screen.getByLabelText("User persona")).toBeInTheDocument();
    expect(screen.getByLabelText("Peer Reviewer persona")).toBeInTheDocument();
  });
});
