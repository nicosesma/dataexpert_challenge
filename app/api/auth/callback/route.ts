import { NextRequest, NextResponse } from "next/server";
import { OAuth2Client } from "google-auth-library";

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const client = new OAuth2Client(
    process.env.GOOGLE_OAUTH_CLIENT_ID,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    process.env.GOOGLE_OAUTH_REDIRECT_URI
  );

  try {
    const { tokens } = await client.getToken(code);

    if (!tokens.refresh_token) {
      return new NextResponse(
        `<html><body style="font-family:monospace;background:#0a0a0a;color:#ededed;padding:2rem">
          <h2 style="color:#f87171">No refresh token received</h2>
          <p>Google only returns a refresh token on the <strong>first</strong> authorization.
          To force a new one:</p>
          <ol>
            <li>Go to <a href="https://myaccount.google.com/permissions" style="color:#fb923c">Google Account Permissions</a></li>
            <li>Revoke access for <strong>elsurdrivingschool</strong></li>
            <li>Visit <a href="/api/auth/google" style="color:#fb923c">/api/auth/google</a> again</li>
          </ol>
        </body></html>`,
        { headers: { "Content-Type": "text/html" } }
      );
    }

    return new NextResponse(
      `<html><body style="font-family:monospace;background:#0a0a0a;color:#ededed;padding:2rem">
        <h2 style="color:#4ade80">✓ Authorization successful</h2>
        <p>Copy the refresh token below and add it to your <code>.env</code> file as
        <code>GOOGLE_OAUTH_REFRESH_TOKEN</code>, then restart the dev server.</p>
        <pre style="background:#111;border:1px solid #333;padding:1rem;border-radius:8px;overflow-wrap:break-word;white-space:pre-wrap">${tokens.refresh_token}</pre>
      </body></html>`,
      { headers: { "Content-Type": "text/html" } }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
