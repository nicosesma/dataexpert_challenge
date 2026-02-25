import { describe, it, expect, vi, beforeEach } from "vitest";

// ── Shared mock fns declared at module scope but referenced inside factory via closure ──
const mockSetText = vi.fn();
const mockGetTextField = vi.fn(() => ({ setText: mockSetText }));
const mockSave = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
const mockGetForm = vi.fn(() => ({ getTextField: mockGetTextField }));
const mockLoad = vi.fn(async () => ({ getForm: mockGetForm, save: mockSave }));

// ── Mock pdf-lib — factory uses hoisted vi.fn() calls ──────────────────────
vi.mock("pdf-lib", () => {
  const setTextFn = vi.fn();
  const getTextFieldFn = vi.fn(() => ({ setText: setTextFn }));
  const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
  const getFormFn = vi.fn(() => ({ getTextField: getTextFieldFn }));
  const loadFn = vi.fn(async () => ({ getForm: getFormFn, save: saveFn }));
  return { PDFDocument: { load: loadFn } };
});

// ── Mock fs ───────────────────────────────────────────────────────────────────
vi.mock("fs", () => ({
  default: { readFileSync: vi.fn(() => Buffer.from("fake-pdf")) },
  readFileSync: vi.fn(() => Buffer.from("fake-pdf")),
}));


import { PDFDocument } from "pdf-lib";
import { POST } from "@/app/api/export/route";
import { Student } from "@/app/types/student";

// Helpers to access the mock instances set up by pdf-lib's factory
function getPdfMocks() {
  const loadMock = PDFDocument.load as ReturnType<typeof vi.fn>;
  return { loadMock };
}

const baseStudent: Student = {
  email: "maria@test.com",
  firstName: "Maria",
  middleName: "L",
  lastName: "Garcia",
  dob: "01/15/1995",
  birthCity: "Miami",
  birthState: "FL",
  birthCounty: "Miami-Dade",
  birthCountry: "USA",
  addressStreet: "123 Main St",
  addressApt: "2A",
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
};

function makeRequest(body: unknown) {
  return new Request("http://localhost/api/export", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }) as import("next/server").NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();

  // Re-wire the mock pdf-lib after clearAllMocks
  const setTextFn = vi.fn();
  const getTextFieldFn = vi.fn(() => ({ setText: setTextFn }));
  const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
  const getFormFn = vi.fn(() => ({ getTextField: getTextFieldFn }));

  (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValue({
    getForm: getFormFn,
    save: saveFn,
  });
});

describe("POST /api/export", () => {
  it("returns 200 with application/pdf content type", async () => {
    const res = await POST(makeRequest(baseStudent));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
  });

  it("sets Content-Disposition with full name as filename", async () => {
    const res = await POST(makeRequest(baseStudent));
    const disposition = res.headers.get("Content-Disposition");
    expect(disposition).toContain("Maria L Garcia.pdf");
  });

  it("uses just first+last name when middle name is empty", async () => {
    const student = { ...baseStudent, middleName: "" };
    const res = await POST(makeRequest(student));
    const disposition = res.headers.get("Content-Disposition");
    expect(disposition).toContain("Maria Garcia.pdf");
  });

  it("falls back to 'student.pdf' when all name parts are empty", async () => {
    const student = { ...baseStudent, firstName: "", middleName: "", lastName: "" };
    const res = await POST(makeRequest(student));
    const disposition = res.headers.get("Content-Disposition");
    expect(disposition).toContain("student.pdf");
  });

  it("loads the PDF template via PDFDocument.load", async () => {
    await POST(makeRequest(baseStudent));
    const { loadMock } = getPdfMocks();
    expect(loadMock).toHaveBeenCalledOnce();
  });

  it("populates Full Legal Name and individual name fields", async () => {
    // Capture the form mock to inspect calls
    const capturedSetText: string[] = [];
    const capturedFields: string[] = [];

    const setTextFn = vi.fn((v: string) => capturedSetText.push(v));
    const getTextFieldFn = vi.fn((name: string) => { capturedFields.push(name); return { setText: setTextFn }; });
    const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      getForm: vi.fn(() => ({ getTextField: getTextFieldFn })),
      save: saveFn,
    });

    await POST(makeRequest(baseStudent));

    expect(capturedFields).toContain("Full Legal Name");
    expect(capturedFields).toContain("FIRST NAME");
    expect(capturedFields).toContain("MIDDLE NAME");
    expect(capturedFields).toContain("LAST NAME");
    const nameIdx = capturedFields.indexOf("Full Legal Name");
    expect(capturedSetText[nameIdx]).toBe("Maria L Garcia");
  });

  it("populates EMAIL field with correct value", async () => {
    const capturedFields: string[] = [];
    const capturedValues: string[] = [];
    const setTextFn = vi.fn((v: string) => capturedValues.push(v));
    const getTextFieldFn = vi.fn((name: string) => { capturedFields.push(name); return { setText: setTextFn }; });
    const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      getForm: vi.fn(() => ({ getTextField: getTextFieldFn })),
      save: saveFn,
    });

    await POST(makeRequest(baseStudent));
    const emailIdx = capturedFields.indexOf("EMAIL");
    expect(capturedValues[emailIdx]).toBe("maria@test.com");
  });

  it("populates Address combining street and apt", async () => {
    const capturedFields: string[] = [];
    const capturedValues: string[] = [];
    const setTextFn = vi.fn((v: string) => capturedValues.push(v));
    const getTextFieldFn = vi.fn((name: string) => { capturedFields.push(name); return { setText: setTextFn }; });
    const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      getForm: vi.fn(() => ({ getTextField: getTextFieldFn })),
      save: saveFn,
    });

    await POST(makeRequest(baseStudent));
    const idx = capturedFields.indexOf("Address");
    expect(capturedValues[idx]).toBe("123 Main St 2A");
  });

  it("populates address without apt when apt is empty", async () => {
    const capturedFields: string[] = [];
    const capturedValues: string[] = [];
    const setTextFn = vi.fn((v: string) => capturedValues.push(v));
    const getTextFieldFn = vi.fn((name: string) => { capturedFields.push(name); return { setText: setTextFn }; });
    const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      getForm: vi.fn(() => ({ getTextField: getTextFieldFn })),
      save: saveFn,
    });

    await POST(makeRequest({ ...baseStudent, addressApt: "" }));
    const idx = capturedFields.indexOf("Address");
    expect(capturedValues[idx]).toBe("123 Main St");
  });

  it("converts numeric age and weight to string", async () => {
    const capturedFields: string[] = [];
    const capturedValues: string[] = [];
    const setTextFn = vi.fn((v: string) => capturedValues.push(v));
    const getTextFieldFn = vi.fn((name: string) => { capturedFields.push(name); return { setText: setTextFn }; });
    const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      getForm: vi.fn(() => ({ getTextField: getTextFieldFn })),
      save: saveFn,
    });

    await POST(makeRequest(baseStudent));
    const ageIdx = capturedFields.indexOf("Age");
    const weightIdx = capturedFields.indexOf("Weight");
    expect(capturedValues[ageIdx]).toBe("29");
    expect(capturedValues[weightIdx]).toBe("130");
  });

  it("handles null age and weight gracefully (empty string)", async () => {
    const capturedFields: string[] = [];
    const capturedValues: string[] = [];
    const setTextFn = vi.fn((v: string) => capturedValues.push(v));
    const getTextFieldFn = vi.fn((name: string) => { capturedFields.push(name); return { setText: setTextFn }; });
    const saveFn = vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46]));
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      getForm: vi.fn(() => ({ getTextField: getTextFieldFn })),
      save: saveFn,
    });

    const res = await POST(makeRequest({ ...baseStudent, age: null, weight: null }));
    expect(res.status).toBe(200);
    const ageIdx = capturedFields.indexOf("Age");
    expect(capturedValues[ageIdx]).toBe("");
  });

  it("returns 500 when pdf-lib throws", async () => {
    (PDFDocument.load as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error("PDF corrupt"));
    const res = await POST(makeRequest(baseStudent));
    const body = await res.json();
    expect(res.status).toBe(500);
    expect(body.error).toBe("Failed to generate PDF");
  });
});

// ─── Zod input validation tests ────────────────────────────────────────────

describe("POST /api/export — input validation", () => {
  it("returns 400 for a completely empty body", async () => {
    const req = new Request("http://localhost/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "{}",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid request body/i);
  });

  it("returns 400 when required string fields are missing", async () => {
    const req = new Request("http://localhost/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@test.com" }),
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.details).toBeDefined();
  });

  it("returns 400 for malformed JSON", async () => {
    const req = new Request("http://localhost/api/export", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-json",
    });
    const res = await POST(req as unknown as import("next/server").NextRequest);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toMatch(/invalid json/i);
  });
});
