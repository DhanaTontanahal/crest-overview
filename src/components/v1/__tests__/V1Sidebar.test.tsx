import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import V1Sidebar from "../V1Sidebar";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", () => ({
  useLocation: () => ({ pathname: "/v1" }),
  useNavigate: () => mockNavigate,
}));

vi.mock("@/components/ui/sidebar", () => ({
  Sidebar: ({ children }: { children: React.ReactNode }) => <div data-testid="sidebar">{children}</div>,
  SidebarContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroup: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarGroupLabel: ({ children, className }: { children: React.ReactNode; className?: string }) => (
    <span data-testid="group-label" className={className}>{children}</span>
  ),
  SidebarGroupContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  SidebarMenu: ({ children }: { children: React.ReactNode }) => <ul>{children}</ul>,
  SidebarMenuItem: ({ children }: { children: React.ReactNode }) => <li>{children}</li>,
  SidebarMenuButton: ({ children, onClick, tooltip }: { children: React.ReactNode; onClick: () => void; tooltip?: string; className?: string }) => (
    <button onClick={onClick} aria-label={tooltip}>{children}</button>
  ),
  useSidebar: () => ({ state: "expanded" }),
}));

let mockUser: { role: string; platformId?: string } | null = { role: "admin" };
vi.mock("@/context/AppContext", () => ({
  useAppState: () => ({ user: mockUser }),
}));

describe("V1Sidebar", () => {
  it("renders dashboard items for all roles", () => {
    render(<V1Sidebar />);
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("Metric Dimensions")).toBeInTheDocument();
    expect(screen.getByText("Trends")).toBeInTheDocument();
    expect(screen.getByText("Team Data")).toBeInTheDocument();
  });

  it("shows admin-only items for admin role", () => {
    mockUser = { role: "admin" };
    render(<V1Sidebar />);
    expect(screen.getByText("Create Assessment")).toBeInTheDocument();
    expect(screen.getByText("Personas")).toBeInTheDocument();
    expect(screen.getByText("Data Upload")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("shows user-specific items for user role", () => {
    mockUser = { role: "user", platformId: "Platform A" };
    render(<V1Sidebar />);
    expect(screen.getByText("Self Assessment")).toBeInTheDocument();
    expect(screen.getByText("Cross-Platform Analysis")).toBeInTheDocument();
    expect(screen.queryByText("Create Assessment")).not.toBeInTheDocument();
    expect(screen.queryByText("Personas")).not.toBeInTheDocument();
  });

  it("shows reviewer-specific items for reviewer role", () => {
    mockUser = { role: "reviewer" };
    render(<V1Sidebar />);
    expect(screen.getByText("Peer Review")).toBeInTheDocument();
    expect(screen.queryByText("Self Assessment")).not.toBeInTheDocument();
    expect(screen.queryByText("Cross-Platform Analysis")).not.toBeInTheDocument();
  });

  it("always shows View Assessments for all roles", () => {
    mockUser = { role: "reviewer" };
    render(<V1Sidebar />);
    expect(screen.getByText("View Assessments")).toBeInTheDocument();
  });
});
