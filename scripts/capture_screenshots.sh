#!/bin/bash
set -e

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUTPUT_DIR="docs/screenshots"
mkdir -p "$OUTPUT_DIR"

echo "Capturing Light Theme screenshots..."

# Array of page:filename
PAGES=(
  "overview:overview.png"
  "incidents:incidents.png"
  "incident-detail:incident-detail.png"
  "ai-investigation:ai-investigation.png"
  "rca-reports:rca-reports.png"
  "infrastructure:infrastructure.png"
  "kubernetes:kubernetes.png"
  "metrics-traces:metrics-traces.png"
  "deployments:deployments.png"
  "remediation:remediation.png"
  "knowledge-base:knowledge-base.png"
  "analytics:analytics.png"
  "integrations:integrations.png"
  "team:team-management.png"
  "audit-logs:audit-logs.png"
  "settings:settings.png"
)

for item in "${PAGES[@]}"; do
  TAB="${item%%:*}"
  FILE="${item##*:}"
  echo "Capturing [Light Theme] $TAB -> $OUTPUT_DIR/$FILE"
  "$CHROME" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=1440,900 --screenshot="$OUTPUT_DIR/$FILE" "http://localhost:5173/?theme=light#$TAB" >/dev/null 2>&1
done

echo "Capturing 1 Dark Theme screenshot: Logs Explorer..."
"$CHROME" --headless=new --disable-gpu --virtual-time-budget=3000 --window-size=1440,900 --screenshot="$OUTPUT_DIR/logs-explorer.png" "http://localhost:5173/?theme=dark#logs" >/dev/null 2>&1

echo "All screenshots captured successfully in $OUTPUT_DIR:"
ls -lh "$OUTPUT_DIR"
