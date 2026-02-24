import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @googleapis/sheets before importing the route
vi.mock("@googleapis/sheets", () => ({
  sheets: vi.fn(),
}));

// Mock google-auth-library — must use a real function so it's newable
vi.mock("google-auth-library", () => {
  const OAuth2Client = vi.fn(function (this: Record<string, unknown>) {
    this.setCredentials = vi.fn();
  });
  return { OAuth2Client };
});

import { sheets } from "@googleapis/sheets";
import { GET } from "@/app/api/students/route";

const mockGet = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  process.env.GOOGLE_SHEETS_ID = "test-sheet-id";
  process.env.GOOGLE_OAUTH_CLIENT_ID = "test-client-id";
  process.env.GOOGLE_OAUTH_CLIENT_SECRET = "test-secret";
  process.env.GOOGLE_OAUTH_REDIRECT_URI = "http://localhost:3000/api/auth/callback";
  process.env.GOOGLE_OAUTH_REFRESH_TOKEN = "test-refresh-token";

  (sheets as ReturnType<typeof vi.fn>).mockReturnValue({
    spreadsheets: {
      values: {
        get: mockGet,
      },
    },
  });
});

const HEADER_ROW = ["Timestamp", "Email", "LastName", "FirstName", "MiddleName",
  "DOB", "BirthCity", "BirthState", "BirthCounty", "BirthCountry",
  "Street", "Apt", "County", "City", "State", "Zip", "Phone",
  "PermitNum", "PermitState", "PermitIssue", "PermitExpire",
  "Age", "Gender", "EyeColor", "HairColor", "Race", "Ethnicity",
  "Weight", "Height", "FatherLN", "MotherLN",
  "PC1Name", "PC1Phone", "PC1Addr", "PC2Name", "PC2Phone", "PC2Addr"];

const DATA_ROW = ["2024-01-01", "test@example.com", "Garcia", "Maria", "L",
  "01/15/1995", "Miami", "FL", "Miami-Dade", "USA",
  "123 Main St", "2A", "Miami-Dade", "Miami", "FL", "33101", "3051234567",
  "D123456", "FL", "01/01/2020", "01/01/2026",
  "29", "Female", "Brown", "Black", "Hispanic", "Hispanic",
  "130", "5'4\"", "Garcia", "Lopez",
  "Juan Garcia", "3059876543", "123 Main St", "", "", ""];

describe("GET /api/students", () => {
  it("returns mapped students from the spreadsheet", async () => {
    mockGet.mockResolvedValue({ data: { values: [HEADER_ROW, DATA_ROW] } });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.students).toHaveLength(1);
    expect(body.students[0]).toMatchObject({
      email: "test@example.com",
      firstName: "Maria",
      lastName: "Garcia",
      dob: "01/15/1995",
      birthCity: "Miami",
      age: 29,
      weight: 130,
    });
  });

  it("returns empty array when sheet has only a header row", async () => {
    mockGet.mockResolvedValue({ data: { values: [HEADER_ROW] } });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.students).toHaveLength(0);
  });

  it("returns empty array when sheet has no values", async () => {
    mockGet.mockResolvedValue({ data: { values: null } });

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.students).toHaveLength(0);
  });

  it("parses age and weight as numbers", async () => {
    mockGet.mockResolvedValue({ data: { values: [HEADER_ROW, DATA_ROW] } });

    const res = await GET();
    const body = await res.json();
    const student = body.students[0];

    expect(typeof student.age).toBe("number");
    expect(typeof student.weight).toBe("number");
    expect(student.age).toBe(29);
    expect(student.weight).toBe(130);
  });

  it("returns null for empty age/weight cells", async () => {
    const rowWithEmptyNums = [...DATA_ROW];
    rowWithEmptyNums[21] = ""; // age
    rowWithEmptyNums[27] = ""; // weight
    mockGet.mockResolvedValue({ data: { values: [HEADER_ROW, rowWithEmptyNums] } });

    const res = await GET();
    const body = await res.json();

    expect(body.students[0].age).toBeNull();
    expect(body.students[0].weight).toBeNull();
  });

  it("skips rows with insufficient columns", async () => {
    mockGet.mockResolvedValue({
      data: { values: [HEADER_ROW, ["only-one-cell"], DATA_ROW] },
    });

    const res = await GET();
    const body = await res.json();

    expect(body.students).toHaveLength(1);
    expect(body.students[0].email).toBe("test@example.com");
  });

  it("returns 401 when refresh token is missing", async () => {
    delete process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(401);
    expect(body.error).toMatch(/not authorized/i);
  });

  it("returns 500 when sheet ID is missing", async () => {
    delete process.env.GOOGLE_SHEETS_ID;

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toMatch(/missing/i);
  });

  it("returns 500 when the Google Sheets API throws", async () => {
    mockGet.mockRejectedValue(new Error("Network error"));

    const res = await GET();
    const body = await res.json();

    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to fetch spreadsheet data");
  });
});
