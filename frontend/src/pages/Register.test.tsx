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
  waitFor,
} from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import Register from "./Register";
import { authService } from "../services/auth.service";

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual =
    await importOriginal<
      typeof import("react-router-dom")
    >();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("../services/auth.service", () => ({
  authService: { register: vi.fn() },
}));

describe("Register Page (UI Tests)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderRegister = () =>
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    );

  it("should render all form fields and submit button properly", () => {
    renderRegister();

    expect(
      screen.getByRole("heading", {
        name: /register for yoga studio/i,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/first name/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/last name/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/email/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/password/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^register$/i }),
    ).toBeInTheDocument();
  });

 it("should register successfully and redirect to /sessions", async () => {
  vi.mocked(authService.register).mockResolvedValueOnce({
    token: "fake-jwt",
    id: 2,
    email: "john@doe.com",
    firstName: "John",
    lastName: "Doe",
    admin: false,
  });

  renderRegister();


  fireEvent.change(screen.getByLabelText(/first name/i), { target: { value: "John" } });
  fireEvent.change(screen.getByLabelText(/last name/i), { target: { value: "Doe" } });
  fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "john@doe.com" } });
  fireEvent.change(screen.getByLabelText(/password/i), { target: { value: "password123" } });

  const submitButton = screen.getByRole("button", { name: /^register$/i });
  fireEvent.click(submitButton);

  
  expect(await screen.findByText(/registering.../i)).toBeInTheDocument();


  await waitFor(() => {
    expect(authService.register).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith("/sessions");
  });
});

  it("should display an error message when registration fails", async () => {
    const apiError = {
      response: {
        data: { message: "Email already exists" },
      },
    };
    vi.mocked(authService.register).mockRejectedValueOnce(
      apiError,
    );

    renderRegister();

    fireEvent.change(screen.getByLabelText(/first name/i), {
      target: { value: "John" },
    });
    fireEvent.change(screen.getByLabelText(/last name/i), {
      target: { value: "Doe" },
    });
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "existing@doe.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: /^register$/i }),
    );

    const errorMessage = await screen.findByText(
      /email already exists/i,
    );
    expect(errorMessage).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /^register$/i }),
    ).not.toBeDisabled();
  });
});
