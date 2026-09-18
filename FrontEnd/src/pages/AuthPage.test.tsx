import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AuthPage from "./AuthPage";
import { ApiError } from "@/services/api-client";

const submitMock = vi.hoisted(() => vi.fn());

vi.mock("@/hooks/use-auth-form", () => ({
  useAuthForm: () => ({
    submit: submitMock,
    isSubmitting: false,
  }),
}));

describe("AuthPage", () => {
  it("shows invalid login errors", async () => {
    submitMock.mockRejectedValue(new ApiError("Invalid credentials", 401));

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText("Email"), {
      target: { value: "user@example.com" },
    });
    fireEvent.change(screen.getByLabelText("Password"), {
      target: { value: "wrong-password" },
    });
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
  });

  it("allows switching to register mode", () => {
    submitMock.mockReset();

    render(
      <MemoryRouter>
        <AuthPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /sign up/i }));

    expect(
      screen.getByRole("button", { name: /register/i }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
  });
});
