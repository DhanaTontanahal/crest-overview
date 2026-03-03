import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import V1Header from "../V1Header";

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}));

// Mock AppContext
const mockSetUser = vi.fn();
const mockState = {
  user: { name: "Admin", role: "admin", platformId: undefined },
  setUser: mockSetUser,
  selectedQuarter: "Q4 2025",
  setSelectedQuarter: vi.fn(),
  selectedPlatform: "All",
  setSelectedPlatform: vi.fn(),
  selectedPillar: "All",
  setSelectedPillar: vi.fn(),
  platforms: ["Platform A", "Platform B"],
  pillars: ["People", "Process"],
  availableQuarters: ["Q3 2025", "Q4 2025"],
};

vi.mock("@/context/AppContext", () => ({
  useAppState: () => mockState,
}));

describe("V1Header", () => {
  it("renders the header title with v1 badge", () => {
    render(<V1Header />);
    expect(screen.getByText("Platform Maturity")).toBeInTheDocument();
    expect(screen.getByText("v1")).toBeInTheDocument();
  });

  it("displays the user role label", () => {
    render(<V1Header />);
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("shows platform selector for admin role", () => {
    render(<V1Header />);
    // Admin should see the platform filter (3 SelectTriggers: quarter, platform, pillar)
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(3);
  });

  it("hides platform selector for non-admin roles", () => {
    mockState.user = { name: "User", role: "user", platformId: "Platform A" };
    render(<V1Header />);
    // User should see only 2 SelectTriggers: quarter, pillar
    const triggers = screen.getAllByRole("combobox");
    expect(triggers.length).toBe(2);
    // Restore
    mockState.user = { name: "Admin", role: "admin", platformId: undefined };
  });

  it("displays platform ID for user role", () => {
    mockState.user = { name: "User", role: "user", platformId: "Platform A" };
    render(<V1Header />);
    expect(screen.getByText(/Platform A/)).toBeInTheDocument();
    mockState.user = { name: "Admin", role: "admin", platformId: undefined };
  });

  it("calls setUser(null) and navigates on logout", async () => {
    render(<V1Header />);
    const logoutBtn = screen.getByText("Logout");
    await userEvent.click(logoutBtn);
    expect(mockSetUser).toHaveBeenCalledWith(null);
    expect(mockNavigate).toHaveBeenCalledWith("/v1");
  });
});
