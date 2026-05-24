import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
} from "vitest";
import {
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Sessions from "./Sessions";
import { authService } from "../services/auth.service";
import api from "../services/api";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("react-router-dom")
    >();
  return { ...actual };
});

vi.mock("../services/api", () => ({
  default: { get: vi.fn(), delete: vi.fn() },
}));

vi.mock("../services/auth.service", () => ({
  authService: {
    getCurrentUser: vi.fn(),
    getToken: vi.fn(),
  },
}));

describe("Sessions Page (UI Tests)", () => {
  const mockSessionsList = [
    {
      id: 1,
      name: "Morning Yin Yoga",
      date: "2026-05-30T08:00:00.000Z",
      description: "...",
      teacher: { firstName: "Alice", lastName: "Zen" },
      users: [10, 11],
    },
    {
      id: 2,
      name: "Power Ashtanga",
      date: "2026-06-01T18:00:00.000Z",
      description: "...",
      teacher: { firstName: "Bob", lastName: "Fit" },
      users: [],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockImplementation(
      () => true,
    );
    vi.spyOn(window, "alert").mockImplementation(() => {});
    vi.mocked(authService.getToken).mockReturnValue(
      "fake-token",
    );
  });

  const renderSessions = () =>
    render(
      <MemoryRouter>
        <Sessions />
      </MemoryRouter>,
    );

  it("should display the loading screen on mount", () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 1,
      admin: false,
      token: "fake-jwt",
      email: "user@test.com",
      firstName: "John",
      lastName: "Doe",
    });
    vi.mocked(api.get).mockReturnValue(
      new Promise(() => {}),
    );

    renderSessions();
    expect(
      screen.getByText(/loading sessions.../i),
    ).toBeInTheDocument();
  });

  it("should display the error banner upon request failure", async () => {

    const consoleSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 1,
      admin: false,
      token: "fake-jwt",
      email: "user@test.com",
      firstName: "John",
      lastName: "Doe",
    });


    vi.mocked(api.get).mockRejectedValueOnce(
      new Error("Network Error"),
    );

    renderSessions();


    const errorBanner = await screen.findByText(
      /failed to load sessions/i,
    );
    expect(errorBanner).toBeInTheDocument();

    consoleSpy.mockRestore();
  });

  it("should render placeholders when session catalog is empty", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 1,
      admin: false,
      token: "fake-jwt",
      email: "user@test.com",
      firstName: "John",
      lastName: "Doe",
    });
    vi.mocked(api.get).mockResolvedValueOnce({ data: [] });

    renderSessions();
    expect(
      await screen.findByText(/no sessions available/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: /create session/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("should render sessions catalog without management buttons for standard users", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 1,
      admin: false,
      token: "fake-jwt",
      email: "user@test.com",
      firstName: "John",
      lastName: "Doe",
    });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: mockSessionsList,
    });

    renderSessions();
    expect(
      await screen.findByText(/morning yin yoga/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/power ashtanga/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("link", {
        name: /create session/i,
      }),
    ).not.toBeInTheDocument();
  });

  it("should present administrative features if verified user is admin", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 2,
      admin: true,
      token: "fake-jwt",
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "User",
    });
    vi.mocked(api.get).mockResolvedValueOnce({
      data: mockSessionsList,
    });

    renderSessions();
    expect(
      await screen.findByRole("link", {
        name: /create session/i,
      }),
    ).toBeInTheDocument();
    const deleteButtons = await screen.findAllByRole(
      "button",
      { name: /delete/i },
    );
    expect(deleteButtons).toHaveLength(2);
  });

  it("should proceed with deletion and reload upon admin confirmation click", async () => {
    vi.mocked(authService.getCurrentUser).mockReturnValue({
      id: 2,
      admin: true,
      token: "fake-jwt",
      email: "admin@test.com",
      firstName: "Admin",
      lastName: "User",
    });
    vi.mocked(api.get)
      .mockResolvedValueOnce({ data: mockSessionsList })
      .mockResolvedValueOnce({
        data: [mockSessionsList[1]],
      });
    vi.mocked(api.delete).mockResolvedValueOnce({
      data: {},
    });

    renderSessions();

    const deleteButtons = await screen.findAllByRole(
      "button",
      { name: /delete/i },
    );
    fireEvent.click(deleteButtons[0]);

    expect(window.confirm).toHaveBeenCalled();
    expect(api.delete).toHaveBeenCalledWith(
      "/session/1",
      expect.any(Object),
    );
    
    expect(
      await screen.findByText(/power ashtanga/i),
    ).toBeInTheDocument();
  });
});
