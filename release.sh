#!/bin/bash
# Release script for Gmail Snooze Extension
# Usage: ./release.sh <version>
# Example: ./release.sh 1.1.0

set -e

if [ -z "$1" ]; then
  echo "Error: Version number required"
  echo "Usage: ./release.sh <version>"
  echo "Example: ./release.sh 1.1.0"
  exit 1
fi

VERSION=$1
ZIP_NAME="gmail-snooze-extension-v${VERSION}.zip"

echo "🔨 Building extension..."
bun run build

echo "📦 Creating zip archive..."
cd dist
zip -r "../${ZIP_NAME}" .
cd ..

echo "🚀 Creating GitHub release..."
gh release create "v${VERSION}" "${ZIP_NAME}" \
  --title "Gmail Snooze Natural-Language Input v${VERSION}" \
  --generate-notes

echo "✅ Release v${VERSION} created successfully!"
echo "View it at: $(gh repo view --json url -q .url)/releases/tag/v${VERSION}"
