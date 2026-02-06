#!/bin/bash
# =============================================================
# GitHub Repository Setup Script
# Malmvägen 1 - Multilingual Property Landing Page
# =============================================================
#
# Usage:
#   chmod +x setup-github.sh
#   ./setup-github.sh
#
# Prerequisites:
#   - gh CLI installed (brew install gh / winget install GitHub.cli)
#   - Authenticated: gh auth login
# =============================================================

REPO_NAME="maklarhuset-landing"
REPO_DESC="Multilingual property landing page for Malmvägen 1, Ädelfors - Swedish villa with 4 language support"

echo "Creating GitHub repository: $REPO_NAME"

# Create public repo on GitHub
gh repo create "$REPO_NAME" \
  --public \
  --description "$REPO_DESC" \
  --source . \
  --remote origin \
  --push

# Enable GitHub Pages
echo "Enabling GitHub Pages..."
gh api repos/{owner}/$REPO_NAME/pages \
  --method POST \
  --field source='{"branch":"master","path":"/"}' 2>/dev/null || echo "Pages may need manual activation"

echo ""
echo "Done! Your repository is available at:"
echo "  https://github.com/$(gh api user --jq '.login')/$REPO_NAME"
echo ""
echo "GitHub Pages will be available at:"
echo "  https://$(gh api user --jq '.login').github.io/$REPO_NAME/"
