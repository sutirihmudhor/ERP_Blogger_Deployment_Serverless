import { google } from "googleapis";

export function oauthClient() {
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    redirectUri
  );
}

export function bloggerClient() {
  const auth = oauthClient();
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;
  if (!refreshToken) {
    throw new Error("GOOGLE_REFRESH_TOKEN belum diisi di environment serverless.");
  }
  auth.setCredentials({ refresh_token: refreshToken });
  return google.blogger({ version: "v3", auth });
}

export function googleAuthUrl(state = "erp-blogger-setup") {
  const auth = oauthClient();
  return auth.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: [
      "https://www.googleapis.com/auth/blogger",
      "openid",
      "email"
    ],
    state
  });
}
