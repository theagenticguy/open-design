#!/usr/bin/env bash
# Weekly upstream-sync ritual.
#
# Run from repo root. Pulls nexu-io/main, merges into the current branch,
# re-applies the idempotent translation scrub. The .gitattributes
# `merge=ours` driver protects every curation file from being overwritten.
#
# Conflict cookbook:
#   - Curation files (LAITHS_PICKS.md, scripts/sync-upstream.sh,
#     scripts/scrub-translations.sh, craft/anti-ai-slop-laith.md):
#       resolved automatically as "ours" by the merge driver.
#   - Translation files (i18n/<code>/, README.<code>.md, etc.):
#       upstream may re-add root-level translations after edits to
#       canonical English docs. scrub-translations.sh re-relocates them.
#   - Real conflicts in load-bearing source files:
#       fix by hand, commit, then continue. Don't paper over with -X ours
#       on the broader merge — that drops legitimate upstream patches.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

# Verify upstream remote
if ! git remote get-url upstream >/dev/null 2>&1; then
  echo "ERROR: 'upstream' remote not configured."
  echo "  git remote add upstream https://github.com/nexu-io/open-design.git"
  exit 1
fi

# Verify the merge driver is registered (one-time setup).
if [[ "$(git config --get merge.ours.driver || true)" != "true" ]]; then
  echo "Registering merge.ours.driver (one-time setup)..."
  git config merge.ours.driver true
fi

CURRENT_BRANCH="$(git branch --show-current)"
echo "Current branch: $CURRENT_BRANCH"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: working tree is dirty. Commit or stash first."
  exit 1
fi

echo "→ Fetching upstream..."
git fetch upstream

UPSTREAM_BEHIND="$(git rev-list --count HEAD..upstream/main)"
if [[ "$UPSTREAM_BEHIND" == "0" ]]; then
  echo "Already up to date with upstream/main."
  exit 0
fi

echo "→ Behind upstream by $UPSTREAM_BEHIND commit(s). Merging..."
git merge upstream/main --no-edit

echo "→ Re-running idempotent translation scrub..."
bash "$REPO_ROOT/scripts/scrub-translations.sh"

if [[ -n "$(git status --porcelain)" ]]; then
  echo "→ Scrub produced changes — committing."
  git -c user.name="Laith Al-Saadoon" -c user.email="lalsaado@amazon.com" \
    add -A
  git -c user.name="Laith Al-Saadoon" -c user.email="lalsaado@amazon.com" \
    commit -m "i18n: re-apply translation scrub after upstream sync"
fi

echo "✔ Sync complete."
