import { PDFDocument } from "pdf-lib";
import { NextRequest, NextResponse } from "next/server";
import { Student } from "@/app/types/student";
import fs from "fs";
import path from "path";

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
  const templatePath = path.join(process.cwd(), "assets", "TEMPLATE.pdf");
  const templateBytes = fs.readFileSync(templatePath);
  const pdf = await PDFDocument.load(templateBytes);
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

  return pdf.save();
}

export async function POST(req: NextRequest) {
  try {
    const student: Student = await req.json();

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
