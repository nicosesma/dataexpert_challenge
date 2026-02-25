import { PDFDocument } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import fs from "fs";
import path from "path";

const StudentSchema = z.object({
  email: z.string(),
  lastName: z.string(),
  firstName: z.string(),
  middleName: z.string(),
  dob: z.string(),
  birthCity: z.string(),
  birthState: z.string(),
  birthCounty: z.string(),
  birthCountry: z.string(),
  addressStreet: z.string(),
  addressApt: z.string(),
  addressCounty: z.string(),
  addressCity: z.string(),
  addressState: z.string(),
  addressZipCode: z.string(),
  phoneNumber: z.string(),
  drivingPermitNumber: z.string(),
  drivingPermitState: z.string(),
  drivingPermitIssueDate: z.string(),
  drivingPermitExpireDate: z.string(),
  age: z.number().nullable(),
  gender: z.string(),
  eyeColor: z.string(),
  hairColor: z.string(),
  race: z.string(),
  ethnicity: z.string(),
  weight: z.number().nullable(),
  height: z.string(),
  fatherLastName: z.string(),
  motherLastName: z.string(),
  primaryContactName: z.string(),
  primaryContactPhone: z.string(),
  primaryContactAddress: z.string(),
  secondaryContactName: z.string(),
  secondaryContactPhone: z.string(),
  secondaryContactAddress: z.string(),
});

export const runtime = "nodejs";

let cachedTemplateBytes: Buffer | null = null;

function getTemplateBytes(): Buffer {
  if (!cachedTemplateBytes) {
    const templatePath = path.join(process.cwd(), "assets", "TEMPLATE.pdf");
    cachedTemplateBytes = fs.readFileSync(templatePath);
  }
  return cachedTemplateBytes;
}

function str(val: string | number | null | undefined): string {
  if (val === null || val === undefined) return "";
  return String(val);
}

function fullName(s: Student): string {
  return [s.firstName, s.middleName, s.lastName].filter(Boolean).join(" ");
}

function set(form: ReturnType<PDFDocument["getForm"]>, name: string, value: string) {
  try {
    form.getTextField(name).setText(value);
  } catch {
    // field may not exist or may be a non-text type — skip silently
  }
}

async function fillTemplate(student: Student): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(getTemplateBytes());
  const form = pdf.getForm();

  const name = fullName(student);
  const address = [student.addressStreet, student.addressApt].filter(Boolean).join(" ");

  set(form, "Full Legal Name", name);
  set(form, "DOB", str(student.dob));
  set(form, "Date of Birth", str(student.dob));
  set(form, "Driving Permit Number or ID", str(student.drivingPermitNumber));
  set(form, "Phone Number 1", str(student.phoneNumber));
  set(form, "Address", address);
  set(form, "City", str(student.addressCity));
  set(form, "State", str(student.addressState));
  set(form, "ZIP Code", str(student.addressZipCode));
  set(form, "City_2", str(student.addressCity));
  set(form, "State_2", str(student.addressState));
  set(form, "ZIP Code_2", str(student.addressZipCode));
  set(form, "Printed Name of Student", name);
  set(form, "Printed Name of Student_2", name);
  set(form, "LAST NAME", str(student.lastName));
  set(form, "FIRST NAME", str(student.firstName));
  set(form, "MIDDLE NAME", str(student.middleName));
  set(form, "Age", str(student.age));
  set(form, "Weight", str(student.weight));
  set(form, "EMAIL", str(student.email));
  set(form, "Eyes", str(student.eyeColor));
  set(form, "Hair", str(student.hairColor));
  set(form, "Height", str(student.height));
  set(form, "Place of Birth CITY", str(student.birthCity));
  set(form, "Place of Birth COUNTRY", str(student.birthCountry));
  set(form, "Fathers Last Name", str(student.fatherLastName));
  set(form, "Mothers Last Name", str(student.motherLastName));

  return pdf.save({ updateFieldAppearances: true });
}

type Student = z.infer<typeof StudentSchema>;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = StudentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid request body", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  const student = parsed.data;

  try {
    const pdfBytes = await fillTemplate(student);
    const filename = `${fullName(student) || "student"}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("[export API]", err);
    return NextResponse.json({ error: "Failed to generate PDF" }, { status: 500 });
  }
}
