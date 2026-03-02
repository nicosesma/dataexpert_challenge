/**
 * Root page tests — verifies that app/page.tsx re-exports the Dashboard
 * component so the root route renders the dashboard directly (no redirect).
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Home from "@/app/page";

const mockStudents = [
  {
    email: "test@test.com",
    firstName: "Test",
    lastName: "User",
    middleName: "",
    dob: "01/01/2000",
    birthCity: "Miami",
    birthState: "FL",
    birthCounty: "",
    birthCountry: "USA",
    addressStreet: "1 Main St",
    addressApt: "",
    addressCounty: "Miami-Dade",
    addressCity: "Miami",
    addressState: "FL",
    addressZipCode: "33101",
    phoneNumber: "3050000000",
    drivingPermitNumber: "D0000000",
    drivingPermitState: "FL",
    drivingPermitIssueDate: "01/01/2022",
    drivingPermitExpireDate: "01/01/2028",
    age: 24,
    gender: "Female",
    eyeColor: "Brown",
    hairColor: "Black",
    race: "Hispanic",
    ethnicity: "Hispanic",
    weight: 120,
    height: "5'3\"",
    fatherLastName: "User",
    motherLastName: "User",
    primaryContactName: "Contact",
    primaryContactPhone: "3050000001",
    primaryContactAddress: "1 Main St Miami FL",
    secondaryContactName: "",
    secondaryContactPhone: "",
    secondaryContactAddress: "",
  },
];

beforeEach(() => {
  vi.resetAllMocks();
  global.fetch = vi.fn().mockResolvedValue({
    json: () => Promise.resolve({ students: mockStudents }),
  });
});

describe("Root page (app/page.tsx)", () => {
  it("renders the dashboard — not a landing page", async () => {
    render(<Home />);
    // Dashboard loading state should appear (not a landing page heading)
    expect(screen.queryByRole("heading", { name: /data explorer/i })).not.toBeInTheDocument();
    // Loading or student table should be present
    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });
  });

  it("shows a loading spinner while fetching students", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText(/loading students/i)).toBeInTheDocument();
  });

  it("does not render any landing page UI (no ES logo or tagline)", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Test User"));
    expect(screen.queryByText(/Effortlessly manage student records/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Open App/i)).not.toBeInTheDocument();
  });
});
