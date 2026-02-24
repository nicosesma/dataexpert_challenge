import { sheets } from "@googleapis/sheets";
import { OAuth2Client } from "google-auth-library";
import { NextResponse } from "next/server";
import { Student } from "@/app/types/student";

function parseNum(val: string | undefined): number | null {
  if (!val) return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

function cell(row: string[], index: number): string {
  return (row[index] ?? "").trim();
}

function getOAuthClient(): OAuth2Client {
  const client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );
  client.setCredentials({
    refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN,
  });
  return client;
}

export async function GET() {
  const sheetId = process.env.GOOGLE_SHEETS_ID?.split(" ")[0];
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (!sheetId) {
    return NextResponse.json({ error: "Missing GOOGLE_SHEETS_ID" }, { status: 500 });
  }

  if (!refreshToken) {
    return NextResponse.json(
      { error: "Not authorized. Visit /api/auth/google to connect your Google account." },
      { status: 401 }
    );
  }

  try {
    const auth = getOAuthClient();
    const sheetsClient = sheets({ version: "v4", auth });

    const response = await sheetsClient.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: "A:AK",
    });

    const rows = response.data.values ?? [];
    const dataRows = rows.slice(1);

    const students: Student[] = dataRows
      .filter((row) => row.length > 1)
      .map((row) => ({
        email: cell(row, 1),
        lastName: cell(row, 2),
        firstName: cell(row, 3),
        middleName: cell(row, 4),
        dob: cell(row, 5),
        birthCity: cell(row, 6),
        birthState: cell(row, 7),
        birthCounty: cell(row, 8),
        birthCountry: cell(row, 9),
        addressStreet: cell(row, 10),
        addressApt: cell(row, 11),
        addressCounty: cell(row, 12),
        addressCity: cell(row, 13),
        addressState: cell(row, 14),
        addressZipCode: cell(row, 15),
        phoneNumber: cell(row, 16),
        drivingPermitNumber: cell(row, 17),
        drivingPermitState: cell(row, 18),
        drivingPermitIssueDate: cell(row, 19),
        drivingPermitExpireDate: cell(row, 20),
        age: parseNum(cell(row, 21)),
        gender: cell(row, 22),
        eyeColor: cell(row, 23),
        hairColor: cell(row, 24),
        race: cell(row, 25),
        ethnicity: cell(row, 26),
        weight: parseNum(cell(row, 27)),
        height: cell(row, 28),
        fatherLastName: cell(row, 29),
        motherLastName: cell(row, 30),
        primaryContactName: cell(row, 31),
        primaryContactPhone: cell(row, 32),
        primaryContactAddress: cell(row, 33),
        secondaryContactName: cell(row, 34),
        secondaryContactPhone: cell(row, 35),
        secondaryContactAddress: cell(row, 36),
      }));

    return NextResponse.json({ students });
  } catch (err) {
    console.error("[students API]", err);
    return NextResponse.json(
      { error: "Failed to fetch spreadsheet data" },
      { status: 500 }
    );
  }
}
