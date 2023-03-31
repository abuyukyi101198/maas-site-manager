import { vi } from "vitest";

import EnrollmentActions from "./EnrollmentActions";

import type * as apiHooks from "@/hooks/api";
import { render, screen, within } from "@/test-utils";

const enrollmentRequestsMutationMock = vi.fn();

it("displays enrollment action buttons", () => {
  render(<EnrollmentActions />);

  expect(screen.getByRole("button", { name: /Deny/i })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: /Accept/i })).toBeInTheDocument();
});

it("can display an error message on request error", () => {
  vi.mock("@/hooks/api", async (importOriginal) => {
    const original: typeof apiHooks = await importOriginal();
    return {
      ...original,
      useEnrollmentRequestsMutation: () => ({ mutate: enrollmentRequestsMutationMock, isError: true }),
    };
  });
  render(<EnrollmentActions />);

  expect(
    within(screen.getByRole("alert")).getByText(/There was an error processing enrolment request/i),
  ).toBeInTheDocument();
});
