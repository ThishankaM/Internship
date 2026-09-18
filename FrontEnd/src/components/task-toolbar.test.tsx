import { render, screen, fireEvent, act } from "@testing-library/react";
import { TaskToolbar } from "./task-toolbar";

describe("TaskToolbar", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("debounces search changes into filter params", () => {
    const onUpdateParams = vi.fn();

    render(
      <TaskToolbar
        user={null}
        params={{
          page: 1,
          limit: 10,
          sortBy: "created_at",
          sortOrder: "desc",
          filter: "all",
        }}
        onUpdateParams={onUpdateParams}
        onCreate={vi.fn()}
        categories={[]}
        tags={[]}
        projects={[]}
        onManageTaxonomy={vi.fn()}
        onToggleSidebar={vi.fn()}
      />,
    );

    fireEvent.change(screen.getByPlaceholderText("Search tasks..."), {
      target: { value: "backend" },
    });

    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(onUpdateParams).toHaveBeenCalledWith({ search: "backend" });
  });
});
