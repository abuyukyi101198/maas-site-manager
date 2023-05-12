import { render, screen } from "@testing-library/react";

import ErrorMessage from "./ErrorMessage";

it("renders the error message if error is an instance of Error", () => {
  const testError = new Error("Test error message");
  render(<ErrorMessage error={testError} />);
  expect(screen.getByText("Test error message")).toBeInTheDocument();
});

it("renders provided error string", () => {
  const error = "This is a string error";
  render(<ErrorMessage error={error} />);
  expect(screen.getByText("This is a string error")).toBeInTheDocument();
});

it("renders a default error message if no error is provided", () => {
  render(<ErrorMessage error={undefined} />);
  expect(screen.getByText("An unknown error has occured")).toBeInTheDocument();
});
