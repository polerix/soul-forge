# Soul Forge — Spark Pipeline Setup

## Prerequisites

- Python 3.11+
- A Google account
- A Google Cloud project
- Your Anthropic API key

---

## 1. Google Cloud — Service Account

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create a new project (or use an existing one)
3. Enable these APIs:
   - **Google Drive API**
   - **Google Sheets API** *(only needed if you update the sheet directly — otherwise the Apps Script handles it)*
4. Go to **IAM & Admin → Service Accounts → Create**
   - Name: `soul-forge-cron`
   - Role: **Basic → Editor** (or just Drive File Creator)
5. Click the service account → **Keys → Add Key → JSON** → download it
6. Note the service account email (looks like `soul-forge-cron@your-project.iam.gserviceaccount.com`)

---

## 2. Google Drive — wellofsparks folder

The folder is already created:  
**[wellofsparks on Drive](https://drive.google.com/drive/folders/15InIZLpglbkXjbJntz665Rn8OBjJp1a0)**  
Folder ID: `15InIZLpglbkXjbJntz665Rn8OBjJp1a0` (already set in `forge_cron.py`)

1. Right-click the folder → **Share** → add the **service account email** with **Editor** access  
   *(the email looks like `soul-forge-cron@your-project.iam.gserviceaccount.com`)*

---

## 3. Google Apps Script → SparkQueue

The spreadsheet is already created:  
**[Soul Forge Spark Queue](https://docs.google.com/spreadsheets/d/1-EuRSH7VXUjs2nW9Qiro_yVhlzfoYEaKJ4jDVe07d0I/edit)**

1. Open it → **Extensions → Apps Script**
2. Paste the contents of `apps-script/queue.gs` into the editor (replace any existing code)
3. Click **Deploy → New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Click **Authorize access** when prompted
5. Copy the **Web app URL** — this is your `APPS_SCRIPT_URL`

---

## 4. Environment Variables

Add these to your shell profile (`~/.zshrc` or `~/.zshenv`):

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
export APPS_SCRIPT_URL="https://script.google.com/macros/s/.../exec"
export GOOGLE_SERVICE_ACCOUNT_JSON="/path/to/soul-forge-cron.json"
export GOOGLE_DRIVE_FOLDER_ID="1abc..."
export REPO_PATH="/Users/polerix/Documents/GitHub/soul-forge"
```

Then reload: `source ~/.zshrc`

---

## 5. Install Python dependencies

```bash
cd /Users/polerix/Documents/GitHub/soul-forge/wellofsparks
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

---

## 6. Test the cron job

```bash
# Dry run — no API calls made
python forge_cron.py --dry-run

# Single real run
python forge_cron.py --once
```

---

## 7. Schedule with launchd (Mac)

Create `~/Library/LaunchAgents/dev.openClaw.soulforge.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>dev.openClaw.soulforge</string>
  <key>ProgramArguments</key>
  <array>
    <string>/Users/polerix/Documents/GitHub/soul-forge/wellofsparks/.venv/bin/python</string>
    <string>/Users/polerix/Documents/GitHub/soul-forge/wellofsparks/forge_cron.py</string>
    <string>--once</string>
  </array>
  <key>EnvironmentVariables</key>
  <dict>
    <key>ANTHROPIC_API_KEY</key>   <string>sk-ant-...</string>
    <key>APPS_SCRIPT_URL</key>     <string>https://script.google.com/...</string>
    <key>GOOGLE_SERVICE_ACCOUNT_JSON</key> <string>/path/to/soul-forge-cron.json</string>
    <key>GOOGLE_DRIVE_FOLDER_ID</key>  <string>1abc...</string>
    <key>REPO_PATH</key>           <string>/Users/polerix/Documents/GitHub/soul-forge</string>
  </dict>
  <key>StartInterval</key>
  <integer>900</integer>
  <key>StandardOutPath</key>  <string>/tmp/soulforge-cron.log</string>
  <key>StandardErrorPath</key><string>/tmp/soulforge-cron.err</string>
  <key>RunAtLoad</key><true/>
</dict>
</plist>
```

Load it:
```bash
launchctl load ~/Library/LaunchAgents/dev.openClaw.soulforge.plist

# Check logs
tail -f /tmp/soulforge-cron.log
```

---

## 8. Update soul-forge.jsx

✅ `APPS_SCRIPT_URL` is already set in `soul-forge.jsx` and `forge_cron.py`.

`MANIFEST_URL` is already pointed at:
```
https://raw.githubusercontent.com/polerix/soul-forge/main/wellofsparks/sparks-manifest.json
```
No changes needed.

---

## Flow recap

```
1. User searches "Atticus Finch" → not in seeds → submits request form
2. form POSTs { name, query } to Apps Script → Sheet gets a "pending" row
3. launchd fires forge_cron.py every 15 min
4. cron fetches pending rows → generates SOUL.md + avatar.svg + spark.zip
5. zip uploaded to Drive wellofsparks/ → row updated to "done"
6. sparks-manifest.json rebuilt → git commit + push to GitHub
7. Soul Forge site fetches manifest on load → shows "Community Sparks" grid
```
