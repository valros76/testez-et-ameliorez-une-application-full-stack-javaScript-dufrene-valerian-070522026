import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import SessionForm from "./SessionForm";
import { authService } from "../services/auth.service";
import api from "../services/api";

const mockNavigate = vi.fn();
let mockParams: { id?: string } = {};

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();
  return { ...actual, useParams: () => mockParams, useNavigate: () => mockNavigate };
});

vi.mock("../services/api", () => ({ default: { get: vi.fn(), post: vi.fn(), put: vi.fn() } }));
vi.mock("../services/auth.service", () => ({ authService: { getCurrentUser: vi.fn(), getToken: vi.fn() } }));

describe("SessionForm Component (UI Tests)", () => {
  const user = userEvent.setup(); 
  
  const mockTeachers = [
    { id: 1, firstName: "John", lastName: "Doe", createdAt: "", updatedAt: "" },
    { id: 2, firstName: "Jane", lastName: "Smith", createdAt: "", updatedAt: "" },
  ];

  const mockSession = {
    id: 5,
    name: "Ashtanga Basics",
    date: "2026-08-20T00:00:00.000Z",
    description: "Introduction to Ashtanga primary series.",
    teacher: { id: 2, firstName: "Jane", lastName: "Smith" },
    users: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockParams = {};
    vi.mocked(authService.getToken).mockReturnValue("fake-token");
  });

  const renderSessionForm = () => render(<MemoryRouter><SessionForm /></MemoryRouter>);

  it("should redirect non-admin users to /sessions", () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: false } as any);
    vi.mocked(api.get).mockResolvedValue({ data: [] });
    renderSessionForm();
    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
  });



  it("should display an explicit error block on API request rejection", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({ id: 1, admin: true } as any);
    vi.mocked(api.get).mockResolvedValueOnce({ data: mockTeachers });

    const errorMessage = "Invalid field entries";
    vi.mocked(api.post).mockRejectedValueOnce({
      response: { data: { message: errorMessage } },
    });

    renderSessionForm();


    await user.type(screen.getByLabelText(/session name/i), "Test Session");
    await user.type(screen.getByLabelText(/date/i), "2026-05-26");
    await user.type(screen.getByLabelText(/description/i), "Description test");
    await user.selectOptions(screen.getByLabelText(/teacher/i), "1");

    const submitButton = screen.getByRole("button", { name: /create session/i });
    await user.click(submitButton);


    const errorElement = await screen.findByText(errorMessage, {}, { timeout: 3000 });
    expect(errorElement).toBeInTheDocument();
    expect(errorElement).toHaveClass("bg-red-100");
  });
});