#!/usr/bin/env python3
"""
Soul Forge — Spark Cron Job
Reads pending requests from Google Sheets, generates spark.zip locally,
uploads to Google Drive, updates the sheet, rebuilds sparks-manifest.json,
and commits it to GitHub.

Usage:
  python forge_cron.py           # run continuously (every 15 min)
  python forge_cron.py --once    # process pending rows once and exit
  python forge_cron.py --dry-run # print what would happen, no API calls

Environment variables (required):
  ANTHROPIC_API_KEY          — your Anthropic key
  APPS_SCRIPT_URL            — the deployed Apps Script web app URL
  GOOGLE_SERVICE_ACCOUNT_JSON — path to GCP service account JSON key file
  GOOGLE_DRIVE_FOLDER_ID     — Drive folder ID for wellofsparks uploads
  REPO_PATH                  — absolute path to the soul-forge git repo (for manifest commit)
"""

import os, sys, json, time, zipfile, subprocess, tempfile, hashlib, argparse
from datetime import datetime, timezone
from pathlib import Path

import anthropic
import requests
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

# ── Config ───────────────────────────────────────────────────────────────────

APPS_SCRIPT_URL       = os.environ.get("APPS_SCRIPT_URL", "https://script.google.com/macros/s/AKfycbzHhJjwZAWJIanx7X78IOEMVCaGcNNqyuM5mtqYrnO4AaosgiXYsJgScD1wSnWPeo3O2Q/exec")
SPREADSHEET_ID        = "1-EuRSH7VXUjs2nW9Qiro_yVhlzfoYEaKJ4jDVe07d0I"
ANTHROPIC_API_KEY     = os.environ.get("ANTHROPIC_API_KEY", "")
SERVICE_ACCOUNT_FILE  = os.environ.get("GOOGLE_SERVICE_ACCOUNT_JSON", "")
DRIVE_FOLDER_ID       = os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "15InIZLpglbkXjbJntz665Rn8OBjJp1a0")
REPO_PATH             = os.environ.get("REPO_PATH", str(Path(__file__).parent.parent))
MANIFEST_PATH         = os.path.join(REPO_PATH, "wellofsparks", "sparks-manifest.json")
CRON_INTERVAL_SEC     = 15 * 60  # 15 minutes
CLAUDE_MODEL          = "claude-sonnet-4-20250514"

GENRE_COLORS = {
    "Mystery": "#c8a97e", "Horror": "#c0392b", "Tragedy": "#8e44ad",
    "Satire": "#e67e22", "Romance": "#e91e8c", "Adventure": "#27ae60",
    "Philosophical": "#2980b9", "Fantasy": "#16a085", "Epic": "#f39c12",
    "Psychological": "#6c3483", "Comedy": "#f1c40f", "Drama": "#d35400",
}

# ── Soul prompt (mirrors soul-forge.jsx) ─────────────────────────────────────

def build_soul_prompt(char: dict) -> str:
    year_str = f"{abs(char['year'])} BCE" if char.get("year", 0) < 0 else str(char.get("year", ""))
    return f"""You are a master of AI personality engineering. Generate a complete SOUL.md file for the public domain character "{char['name']}" from "{char.get('author','Unknown')}" ({year_str}).

A SOUL.md file defines an AI agent's persistent personality, values, communication style, and behavioral philosophy. It is written in Markdown and structured with these sections:

# SOUL.md — [Character Name]
## Core Identity
## Core Truths (5–7 deeply-held beliefs/worldviews in first person)
## Communication Style (tone, vocabulary, mannerisms, verbal tics)
## Behavioral Rules (what this agent does and refuses to do)
## The Vibe (3–5 lines capturing the essence)
## Signature Phrases (5 example lines this agent might say)

Write it as if this character IS the agent — first-person, present tense, specific, opinionated, and true to the literary source. Make it vivid, non-generic, and deeply characteristic. Capture contradictions, obsessions, and authentic voice.

Return ONLY the SOUL.md content in valid Markdown. No preamble, no explanation."""

# ── Avatar SVG generator (mirrors soul-forge.jsx) ────────────────────────────

def build_avatar_svg(char: dict) -> str:
    color = GENRE_COLORS.get(char.get("genre", ""), "#c8972a")
    words = [w for w in char["name"].replace(".", "").split() if w.isalpha()]
    if len(words) >= 2:
        initials = words[0][0].upper() + words[-1][0].upper()
    else:
        initials = (words[0][:2].upper() if words else "?")

    h = 0
    for c in char.get("id", char["name"]):
        h = (h * 31 + ord(c)) & 0xFFFFFFFF
    hue = abs(h) % 360
    bg_dark = f"hsl({hue},18%,7%)"
    bg_mid  = f"hsl({hue},22%,11%)"
    rings   = 3 + (abs(h >> 4) % 3)

    ring_lines = ""
    for i in range(rings):
        r    = 42 - i * 9
        dash = 4 + i * 3
        op   = max(0.02, 0.18 - i * 0.04)
        ring_lines += (
            f'<circle cx="64" cy="64" r="{r}" fill="none" stroke="{color}" '
            f'stroke-width="0.6" stroke-dasharray="{dash} {dash+4}" opacity="{op:.2f}"/>'
        )

    genre = char.get("genre", "").upper()
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="128" height="128">
  <defs>
    <radialGradient id="bg" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="{bg_mid}"/>
      <stop offset="100%" stop-color="{bg_dark}"/>
    </radialGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="{color}" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="{color}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="128" height="128" fill="url(#bg)" rx="4"/>
  <circle cx="64" cy="64" r="62" fill="url(#glow)"/>
  {ring_lines}
  <circle cx="64" cy="64" r="34" fill="none" stroke="{color}" stroke-width="1.2" opacity="0.35"/>
  <line x1="64" y1="2" x2="64" y2="20" stroke="{color}" stroke-width="0.8" opacity="0.25"/>
  <line x1="64" y1="108" x2="64" y2="126" stroke="{color}" stroke-width="0.8" opacity="0.25"/>
  <line x1="2" y1="64" x2="20" y2="64" stroke="{color}" stroke-width="0.8" opacity="0.25"/>
  <line x1="108" y1="64" x2="126" y2="64" stroke="{color}" stroke-width="0.8" opacity="0.25"/>
  <text x="64" y="70" font-family="Georgia, serif" font-size="22" font-weight="700"
        fill="{color}" text-anchor="middle" dominant-baseline="middle" opacity="0.92">{initials}</text>
  <text x="64" y="90" font-family="monospace" font-size="5.5" fill="{color}"
        text-anchor="middle" opacity="0.45" letter-spacing="2">{genre}</text>
  <rect x="1" y="1" width="126" height="126" fill="none" stroke="{color}" stroke-width="0.6" rx="3" opacity="0.2"/>
</svg>"""

# ── Claude: generate SOUL.md ──────────────────────────────────────────────────

def generate_soul(char: dict, dry_run: bool) -> str:
    if dry_run:
        return f"# SOUL.md — {char['name']}\n\n[DRY RUN — not generated]\n"
    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
    print(f"  → Calling Claude for {char['name']}…")
    message = client.messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1500,
        messages=[{"role": "user", "content": build_soul_prompt(char)}],
    )
    return message.content[0].text

# ── Google Drive helpers ──────────────────────────────────────────────────────

def get_drive_service():
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE,
        scopes=["https://www.googleapis.com/auth/drive"],
    )
    return build("drive", "v3", credentials=creds)

def upload_to_drive(drive, zip_path: str, filename: str) -> tuple[str, str]:
    """Upload zip, make it public, return (fileId, shareableLink)."""
    media = MediaFileUpload(zip_path, mimetype="application/zip", resumable=False)
    file_meta = {"name": filename, "parents": [DRIVE_FOLDER_ID]}
    uploaded = drive.files().create(body=file_meta, media_body=media, fields="id").execute()
    file_id = uploaded["id"]

    # Make publicly readable
    drive.permissions().create(
        fileId=file_id,
        body={"role": "reader", "type": "anyone"},
    ).execute()

    # Get shareable link (direct download)
    shareable = f"https://drive.google.com/uc?export=download&id={file_id}"
    view_link = f"https://drive.google.com/file/d/{file_id}/view"
    return file_id, shareable

# ── Sheet updater (via Apps Script POST) ─────────────────────────────────────

def update_sheet_row(char_id: str, status: str, drive_url: str, shareable: str, dry_run: bool):
    if dry_run:
        print(f"  [DRY RUN] Would update sheet row {char_id} → {status}")
        return
    payload = {
        "_update": True,
        "id": char_id,
        "status": status,
        "driveUrl": drive_url,
        "shareableLink": shareable,
        "processedAt": datetime.now(timezone.utc).isoformat(),
    }
    try:
        requests.post(APPS_SCRIPT_URL, json=payload, timeout=15)
    except Exception as e:
        print(f"  ⚠ Sheet update failed for {char_id}: {e}")

# ── Manifest helpers ──────────────────────────────────────────────────────────

def load_manifest() -> list:
    if os.path.exists(MANIFEST_PATH):
        with open(MANIFEST_PATH) as f:
            return json.load(f)
    return []

def save_manifest(entries: list, dry_run: bool):
    if dry_run:
        print(f"  [DRY RUN] Would write manifest with {len(entries)} entries")
        return
    with open(MANIFEST_PATH, "w") as f:
        json.dump(entries, f, indent=2)
    print(f"  ✓ Manifest updated ({len(entries)} sparks)")

def commit_manifest(dry_run: bool):
    if dry_run:
        print("  [DRY RUN] Would git commit sparks-manifest.json")
        return
    try:
        rel = os.path.relpath(MANIFEST_PATH, REPO_PATH)
        subprocess.run(["git", "-C", REPO_PATH, "add", rel], check=True)
        subprocess.run(
            ["git", "-C", REPO_PATH, "commit", "-m",
             f"chore: update sparks-manifest [{datetime.now():%Y-%m-%d %H:%M}]"],
            check=True
        )
        subprocess.run(["git", "-C", REPO_PATH, "push"], check=True)
        print("  ✓ Manifest committed and pushed")
    except subprocess.CalledProcessError as e:
        print(f"  ⚠ Git error: {e}")

# ── Core: process one pending request ────────────────────────────────────────

def process_request(char: dict, dry_run: bool) -> bool:
    char_id = char.get("id") or char["name"].lower().replace(" ", "-")
    print(f"\n▶ Processing: {char['name']} ({char_id})")

    try:
        # 1. Generate SOUL.md
        soul_md = generate_soul(char, dry_run)
        soul_at = datetime.now(timezone.utc).isoformat()

        # 2. Generate avatar.svg
        avatar_svg = build_avatar_svg(char)
        avatar_at = datetime.now(timezone.utc).isoformat()

        # 3. Build spark.json
        packaged_at = datetime.now(timezone.utc).isoformat()
        spark_json = json.dumps({
            "name":     char["name"],
            "id":       char_id,
            "author":   char.get("author", ""),
            "year":     char.get("year", ""),
            "genre":    char.get("genre", ""),
            "era":      char.get("era", ""),
            "complete": True,
            "contents": {
                "SOUL.md":     {"present": True, "generatedAt": soul_at},
                "avatar.svg":  {"present": True, "generatedAt": avatar_at},
            },
            "packagedAt": packaged_at,
            "source":   "https://soul-forge.openClaw.dev",
            "format":   "SOUL.md v1",
        }, indent=2)

        # 4. Package zip
        with tempfile.TemporaryDirectory() as tmp:
            zip_path = os.path.join(tmp, f"{char_id}.spark.zip")
            with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
                zf.writestr("SOUL.md",    soul_md)
                zf.writestr("avatar.svg", avatar_svg)
                zf.writestr("spark.json", spark_json)
            print(f"  ✓ Packaged {char_id}.spark.zip")

            # 5. Upload to Drive
            if not dry_run:
                drive = get_drive_service()
                file_id, shareable = upload_to_drive(drive, zip_path, f"{char_id}.spark.zip")
                drive_url = f"https://drive.google.com/file/d/{file_id}/view"
                print(f"  ✓ Uploaded → {drive_url}")
            else:
                shareable = "https://drive.google.com/uc?export=download&id=DRY_RUN"
                drive_url = "https://drive.google.com/file/d/DRY_RUN/view"

        # 6. Update sheet row
        update_sheet_row(char_id, "done", drive_url, shareable, dry_run)

        # 7. Update manifest
        manifest = load_manifest()
        # Remove any previous entry for this id
        manifest = [e for e in manifest if e.get("id") != char_id]
        manifest.append({
            "id":           char_id,
            "name":         char["name"],
            "author":       char.get("author", ""),
            "year":         char.get("year", ""),
            "genre":        char.get("genre", ""),
            "era":          char.get("era", ""),
            "shareableLink": shareable,
            "processedAt":  packaged_at,
        })
        save_manifest(manifest, dry_run)
        return True

    except Exception as e:
        print(f"  ✗ Failed: {e}")
        update_sheet_row(char_id, "error", "", "", dry_run)
        return False

# ── Fetch pending requests from Apps Script ───────────────────────────────────

def fetch_pending(dry_run: bool) -> list:
    if dry_run:
        # Return a sample for testing
        return [{
            "id": "test-character", "name": "Test Character",
            "query": "Test Character", "author": "Test Author",
            "year": 1900, "genre": "Mystery", "era": "Victorian",
            "status": "pending",
        }]
    try:
        resp = requests.get(APPS_SCRIPT_URL, params={"status": "pending"}, timeout=15)
        resp.raise_for_status()
        return resp.json().get("data", [])
    except Exception as e:
        print(f"⚠ Could not fetch pending requests: {e}")
        return []

# ── Entry point ───────────────────────────────────────────────────────────────

def run_once(dry_run: bool):
    pending = fetch_pending(dry_run)
    if not pending:
        print("✓ No pending requests.")
        return
    print(f"Found {len(pending)} pending request(s).")
    processed = 0
    for char in pending:
        if process_request(char, dry_run):
            processed += 1
    if processed > 0:
        commit_manifest(dry_run)
    print(f"\nDone. Processed {processed}/{len(pending)}.")

def main():
    parser = argparse.ArgumentParser(description="Soul Forge spark cron job")
    parser.add_argument("--once",    action="store_true", help="Run once and exit")
    parser.add_argument("--dry-run", action="store_true", help="Simulate without API calls")
    args = parser.parse_args()

    if not args.dry_run:
        missing = [v for v in ["APPS_SCRIPT_URL","ANTHROPIC_API_KEY","GOOGLE_SERVICE_ACCOUNT_JSON","GOOGLE_DRIVE_FOLDER_ID"] if not os.environ.get(v)]
        if missing:
            print(f"✗ Missing env vars: {', '.join(missing)}")
            print("  See wellofsparks/setup.md for setup instructions.")
            sys.exit(1)

    if args.once or args.dry_run:
        run_once(args.dry_run)
    else:
        print(f"Soul Forge cron running (every {CRON_INTERVAL_SEC//60} min). Ctrl+C to stop.\n")
        while True:
            print(f"[{datetime.now():%H:%M:%S}] Checking for pending requests…")
            run_once(False)
            time.sleep(CRON_INTERVAL_SEC)

if __name__ == "__main__":
    main()
