/**
 * Soul Forge — Spark Request Queue
 * Google Apps Script Web App
 *
 * Deploy: Extensions → Apps Script → Deploy → New deployment
 *   Type: Web app
 *   Execute as: Me
 *   Who has access: Anyone
 *
 * Sheet columns (auto-created on first run):
 *   A: id | B: name | C: query | D: author | E: year | F: genre | G: era
 *   H: requestedAt | I: status | J: driveUrl | K: shareableLink | L: processedAt
 */

const SHEET_NAME = "SparkQueue";
const SPREADSHEET_ID = "1-EuRSH7VXUjs2nW9Qiro_yVhlzfoYEaKJ4jDVe07d0I";
const COLS = ["id","name","query","author","year","genre","era","requestedAt","status","driveUrl","shareableLink","processedAt"];

function getOrCreateSheet() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(COLS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

// ── POST: submit a new spark request ────────────────────────────────────────
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheet = getOrCreateSheet();

    // Deduplicate: check if id already exists
    const existing = sheet.getDataRange().getValues();
    const id = slugify(data.name || data.query || "unknown");
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][0] === id) {
        return jsonResponse({ ok: false, reason: "already_requested", id });
      }
    }

    sheet.appendRow([
      id,
      data.name || data.query,
      data.query || data.name,
      data.author || "",
      data.year   || "",
      data.genre  || "",
      data.era    || "",
      new Date().toISOString(),
      "pending",
      "", "", ""
    ]);

    return jsonResponse({ ok: true, id });
  } catch (err) {
    return jsonResponse({ ok: false, error: err.message }, 500);
  }
}

// ── GET: return all rows as JSON (used by cron + site) ──────────────────────
function doGet(e) {
  const sheet = getOrCreateSheet();
  const rows = sheet.getDataRange().getValues();
  const headers = rows[0];
  const filter = e.parameter.status; // e.g. ?status=pending

  const data = rows.slice(1)
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    })
    .filter(r => !filter || r.status === filter);

  return jsonResponse({ ok: true, data });
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function slugify(str) {
  return str.toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function jsonResponse(obj, code) {
  const output = ContentService.createTextOutput(JSON.stringify(obj));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
