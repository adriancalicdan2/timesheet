const express = require("express");
const cors = require("cors");
const { google } = require("googleapis");
const { GoogleAuth } = require("google-auth-library");

// Initialize the Express app
const app = express();
const port = 3000;

// Enable CORS for specific origin
const NETLIFY_APP_URL = "https://your-app-name.netlify.app"; // Replace with your Netlify domain
app.use(
  cors({
    origin: [NETLIFY_APP_URL, "http://127.0.0.1:5501"], // Allow both local and Netlify domains
    methods: "GET,POST",
    credentials: true,
  })
);

// Middleware to parse JSON
app.use(express.json());

// Replace these with your values
const SPREADSHEET_ID = "1kwmAsBhKPydQh3_0g5YOf-KDag57jM9kTBSee9FBcas"; // Your Google Sheet ID
const SHEET_NAME = "timesheet"; // Your sheet name

// Service account credentials
const CREDENTIALS = {
  type: "service_account",
  project_id: "gen-lang-client-0800661789",
  private_key_id: "9e38880c1673f97e45a364b1d57e40f42fffb4ec",
  private_key: `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCa01AysVEoRg4j
GOLroq2tYi1fmWuwwNX0ddGTZ3/rgKHzELaXVnMm/11BNdmzH5lwpkHSa6c3qsIH
nCWfEOJZ+fVZwG/BQILr9VKRydd+qZc2ZvjkyV8g2riNedWGINv/ND6d9guNHPv0
apWzojoE8341ECXGFNQCvFNmNbjcnNydzaqyL8T08c6gTmp0OZ+2LsT/VDBt0hQZ
R2uOpMXeSACNbjVXj88az5lZc3Dk5tDk1FMosF7JOx2VY1l+MeXymC4AMfDc6OU5
JQM3FZVCr5Ddx1BlA1p9djx8wmJHO6QsgpJor/2sk6f58L37iM3XDxzqxyz+86hH
w1Km/LX3AgMBAAECggEANtJ4ZVrQJ/iWbOsU/ub9pJVNB7rlnRLLL+LAMPfHHfbQ
YacbYH8mCzsFJGATFBAuXusgB4hDD70RM2yhDbAG1mFh9UPkzoMvWKnncOQNwDYA
6yyPGUQMwS9xhfcMGpBsFfPD8F79PBx1Qtiy5YaeEL6/g76SAY/Ceq2AwoJnUQZV
Qj0IYQYe/bUkeAsqB3pukaf3vNQ4uugpCeIsaZN+yBxdfehJ5aIq/Ibttd9F67w2
7YQ/4onR89fgwxzHHep5QT10hUguta1a/PIYQyddYR+tRiX0MYxseFbPeJIErAiX
mIG7/vALAJHxmMW57TA/3o571rglHzZGFSyTwc1RIQKBgQDH1tBfZmhTNKI/PaYV
stptFr4dTjxn5Bvb3UZZmUgJbw8XKrnVqHJgc1R878T/n5IVv6BoBjjZgKJ0q7hX
uzywruYahtVjm9CnWdH2tZqWOTDGEKvf6E+YFx3TcGH+HE6MNfuDYA3Cqdr9CCS8
e8VA98rfJPlCS9pQThyUyzQe3wKBgQDGVgtdGbZHaejairTXE3EtxJay5CAsGNOK
1rhvREiWn1RigoWwqDVdMcvhyCrhrAixmEs5UXFcDRJPWNmOzefectvpIGUL1S69
JuhhuO32RchTHCVzzVYqtNq30i3llxae6W3sUiBBqr6lIkymJafTwKOM2y8QJeab
HqqMXdAD6QKBgQCMYCU3HmSiLhLagZ+tFlnAz3z0cQSVpfK72w+T2Mx1dAIRr/2i
TBUsE1eB+5tSRPEFPfqbl+NPRcDYW9e+KNRU+EbC03wJ4GYNaFbJCoBwjfPo7cUO
H83pdDOLVyI+sfurGjB29H42A8LEg3fqvratEGL9pKdDHq1YQ8Zn7uXJ2QKBgAVi
Qo61avhHTLXZ/Ay2j2TxqDGU9bacuelT6M/EZ8AG9TBzYJOqDUDJYEJxv5A+rkG7
45bbuhsIk82pmMZCmp+0OHn8kiGfGNSzoK0+at87h7OR2QZqtYMVQ7ansu0/i7Km
nYBDvnJp4yDybGg6L3MVEJt7O6zRio/9Zh3HUiU5AoGAHma/9EZX1pl3WR39osif
OiHTRtWz7wYv72TAYGBbFOvOKK2n1MuTBQqGgg+NvrKqFM9NN9geJGdkl/GynI7b
pClaRAeKNUHd39BIkY/UYYI1QKT67bun7Fy0sFtM54HYGJm1TfKwfGfvcnBbkTbJ
CpYZn+7oxkis5NeCnl5nOzQ=
-----END PRIVATE KEY-----`,
  client_email: "timesheet-app@gen-lang-client-0800661789.iam.gserviceaccount.com",
  client_id: "104970947084015866960",
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/timesheet-app%40gen-lang-client-0800661789.iam.gserviceaccount.com",
  universe_domain: "googleapis.com",
};

// Authenticate with Google Sheets API
const auth = new GoogleAuth({
  credentials: CREDENTIALS,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Append row to Google Sheet
async function appendRow(data) {
  const sheets = google.sheets({ version: "v4", auth });
  const response = await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:J`, // Adjust the range based on your sheet
    valueInputOption: "RAW",
    resource: {
      values: [Object.values(data)],
    },
  });
  return response.data;
}

// API endpoint to handle clock-in/clock-out
app.post("/clock", async (req, res) => {
  try {
    const { action, employeeId, latitude, longitude } = req.body;
    const now = new Date();
    const data = {
      id: generateUUID(),
      type: action,
      employee_id: employeeId,
      time: now.toTimeString().split(" ")[0],
      date: now.toISOString().split("T")[0],
      day: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][now.getDay()],
      latitude,
      longitude,
      lat_long: `${latitude} ${longitude}`,
    };
    await appendRow(data);
    res.status(200).json({ success: true, time: data.time });
  } catch (error) {
    console.error("Error in /clock endpoint:", error); // Log the error
    res.status(500).json({ success: false, error: error.message });
  }
});

// Generate a UUID
function generateUUID() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});