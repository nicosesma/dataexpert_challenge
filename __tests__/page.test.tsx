import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Home from "@/app/page";
import { Student } from "@/app/types/student";

const mockStudents: Student[] = [
  {
    email: "maria@test.com",
    firstName: "Maria",
    lastName: "Garcia",
    middleName: "",
    dob: "01/15/1995",
    birthCity: "Miami",
    birthState: "FL",
    birthCounty: "",
    birthCountry: "USA",
    addressStreet: "123 Main St",
    addressApt: "",
    addressCounty: "Miami-Dade",
    addressCity: "Miami",
    addressState: "FL",
    addressZipCode: "33101",
    phoneNumber: "3051234567",
    drivingPermitNumber: "D1234567",
    drivingPermitState: "FL",
    drivingPermitIssueDate: "01/01/2020",
    drivingPermitExpireDate: "01/01/2026",
    age: 29,
    gender: "Female",
    eyeColor: "Brown",
    hairColor: "Black",
    race: "Hispanic",
    ethnicity: "Hispanic",
    weight: 130,
    height: "5'4\"",
    fatherLastName: "Garcia",
    motherLastName: "Lopez",
    primaryContactName: "Juan Garcia",
    primaryContactPhone: "3059876543",
    primaryContactAddress: "123 Main St Miami FL",
    secondaryContactName: "",
    secondaryContactPhone: "",
    secondaryContactAddress: "",
  },
  {
    email: "carlos@test.com",
    firstName: "Carlos",
    lastName: "Rivera",
    middleName: "A",
    dob: "03/22/1990",
    birthCity: "Houston",
    birthState: "TX",
    birthCounty: "",
    birthCountry: "USA",
    addressStreet: "456 Oak Ave",
    addressApt: "2B",
    addressCounty: "Harris",
    addressCity: "Houston",
    addressState: "TX",
    addressZipCode: "77001",
    phoneNumber: "7131234567",
    drivingPermitNumber: "T9876543",
    drivingPermitState: "TX",
    drivingPermitIssueDate: "06/01/2019",
    drivingPermitExpireDate: "06/01/2025",
    age: 34,
    gender: "Male",
    eyeColor: "Hazel",
    hairColor: "Brown",
    race: "Hispanic",
    ethnicity: "Hispanic",
    weight: 175,
    height: "5'10\"",
    fatherLastName: "Rivera",
    motherLastName: "Torres",
    primaryContactName: "Ana Rivera",
    primaryContactPhone: "7139876543",
    primaryContactAddress: "456 Oak Ave Houston TX",
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

// ─── Table display tests ───────────────────────────────────────────────────

describe("Table display", () => {
  it("shows a loading spinner initially", () => {
    global.fetch = vi.fn().mockReturnValue(new Promise(() => {}));
    render(<Home />);
    expect(screen.getByText(/loading students/i)).toBeInTheDocument();
  });

  it("renders student names after fetch", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("Maria Garcia")).toBeInTheDocument();
      expect(screen.getByText("Carlos Rivera")).toBeInTheDocument();
    });
  });

  it("shows an error message when the API fails", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ error: "Sheet not found" }),
    });
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("Sheet not found")).toBeInTheDocument();
    });
  });

  it("shows 'No students found' when list is empty", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      json: () => Promise.resolve({ students: [] }),
    });
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText(/no students found/i)).toBeInTheDocument();
    });
  });

  it("shows total count in footer", async () => {
    render(<Home />);
    await waitFor(() => {
      expect(screen.getByText("2 students total")).toBeInTheDocument();
    });
  });

  it("selects a row via checkbox and updates the footer count", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[1]); // first data row
    expect(screen.getByText("1 of 2 selected")).toBeInTheDocument();
  });

  it("selects all rows with the header checkbox", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    const headerCheckbox = screen.getAllByRole("checkbox")[0];
    await userEvent.click(headerCheckbox);
    expect(screen.getByText("2 of 2 selected")).toBeInTheDocument();
  });

  it("enables the Export button when rows are selected", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    const exportBtn = screen.getByRole("button", { name: /export/i });
    expect(exportBtn).toBeDisabled();
    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[1]);
    expect(exportBtn).not.toBeDisabled();
  });
});

// ─── Detail modal tests ────────────────────────────────────────────────────

describe("Detail modal", () => {
  it("opens when a student name is clicked", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));
    expect(screen.getByRole("heading", { name: "Maria Garcia" })).toBeInTheDocument();
  });

  it("displays all student fields in the modal", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));
    expect(screen.getByDisplayValue("maria@test.com")).toBeInTheDocument();
    expect(screen.getAllByDisplayValue("Miami")[0]).toBeInTheDocument();
    expect(screen.getByDisplayValue("29")).toBeInTheDocument();
  });

  it("closes when the Cancel button is clicked", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(screen.queryByRole("heading", { name: "Maria Garcia" })).not.toBeInTheDocument();
  });

  it("closes when the backdrop is clicked", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));
    const backdrop = document.querySelector(".fixed.inset-0") as HTMLElement;
    fireEvent.click(backdrop);
    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Maria Garcia" })).not.toBeInTheDocument();
    });
  });
});

// ─── Edit form tests ───────────────────────────────────────────────────────

describe("Edit form", () => {
  it("saves edited field value to local state", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));

    const cityInput = screen.getAllByDisplayValue("Miami")[0];
    await userEvent.clear(cityInput);
    await userEvent.type(cityInput, "Orlando");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.queryByRole("heading", { name: "Maria Garcia" })).not.toBeInTheDocument();
    });

    await userEvent.click(screen.getByText("Maria Garcia"));
    expect(screen.getAllByDisplayValue("Orlando")[0]).toBeInTheDocument();
  });

  it("discards edits when Cancel is clicked", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));

    const cityInput = screen.getAllByDisplayValue("Miami")[0];
    await userEvent.clear(cityInput);
    await userEvent.type(cityInput, "Orlando");
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await userEvent.click(screen.getByText("Maria Garcia"));
    expect(screen.getAllByDisplayValue("Miami")[0]).toBeInTheDocument();
  });

  it("shows email validation error for invalid format", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));

    const emailInput = screen.getByDisplayValue("maria@test.com");
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "not-an-email");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();
  });

  it("clears email error when corrected", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));
    await userEvent.click(screen.getByText("Maria Garcia"));

    const emailInput = screen.getByDisplayValue("maria@test.com");
    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "bad");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));
    expect(screen.getByText(/invalid email address/i)).toBeInTheDocument();

    await userEvent.clear(emailInput);
    await userEvent.type(emailInput, "fixed@email.com");
    expect(screen.queryByText(/invalid email address/i)).not.toBeInTheDocument();
  });

  it("updates table name when first/last name is edited", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Carlos Rivera"));
    await userEvent.click(screen.getByText("Carlos Rivera"));

    const lastNameInputs = screen.getAllByDisplayValue("Rivera");
    const lastNameInput = lastNameInputs[0];
    await userEvent.clear(lastNameInput);
    await userEvent.type(lastNameInput, "Gomez");
    await userEvent.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(screen.getByText("Carlos Gomez")).toBeInTheDocument();
    });
  });

  it("adds a blank new student via Add student button", async () => {
    render(<Home />);
    await waitFor(() => screen.getByText("Maria Garcia"));

    await userEvent.click(screen.getByRole("button", { name: /add student/i }));
    expect(screen.getByRole("heading", { name: "—" })).toBeInTheDocument();
  });
});
