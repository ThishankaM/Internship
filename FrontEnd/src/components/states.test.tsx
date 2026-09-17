import { render, screen, fireEvent } from "@testing-library/react";
import { LoadingState } from "./states/loading-state";
import { ErrorState as StandaloneErrorState } from "./states/error-state";

describe("loading and error states", () => {
  it("renders a loading message", () => {
    render(<LoadingState message="Loading tasks..." />);
    expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
  });

  it("renders an error message and supports retry", () => {
    const onRetry = vi.fn();

    render(
      <StandaloneErrorState
        title="Could not load"
        message="Server unavailable"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("Server unavailable")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    expect(onRetry).toHaveBeenCalled();
  });
});
