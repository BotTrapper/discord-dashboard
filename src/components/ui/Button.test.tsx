import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./Button";

describe("Button", () => {
  it("renders with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toHaveTextContent("Click me");
  });

  it("renders with primary variant by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-blue-600");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-gray-200");
  });

  it("renders with danger variant", () => {
    render(<Button variant="danger">Danger</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveClass("bg-red-600");
  });

  it("renders with different sizes", () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-3", "py-1.5", "text-sm");

    rerender(<Button size="md">Medium</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-4", "py-2");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveClass("px-6", "py-3", "text-base");
  });

  it("shows loading state", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button");
    expect(button).toHaveTextContent("Loading...");
    expect(button).toBeDisabled();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("handles click events", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(<Button onClick={() => (clicked = true)}>Click me</Button>);

    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(true);
  });

  it("does not fire click when disabled", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button disabled onClick={() => (clicked = true)}>
        Click me
      </Button>,
    );

    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(false);
  });

  it("does not fire click when loading", async () => {
    const user = userEvent.setup();
    let clicked = false;
    render(
      <Button isLoading onClick={() => (clicked = true)}>
        Click me
      </Button>,
    );

    await user.click(screen.getByRole("button"));
    expect(clicked).toBe(false);
  });
});
