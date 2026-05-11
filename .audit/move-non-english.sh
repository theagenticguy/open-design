#!/usr/bin/env bash
# Open Design — non-English asset relocation script (PROPOSED, DO NOT RUN)
#
# This script moves intermingled translated docs into a parallel `i18n/<locale>/`
# tree. It does NOT delete anything and does NOT rewrite cross-links — the link
# rewrite is a separate sed pass at the bottom, kept commented for safety.
#
# Default mode is --dry-run. Run with `EXECUTE=1 bash move-non-english.sh` to
# actually `git mv` files. Always run from the repo root.
#
# Audited and authored against repo state on 2026-05-11. Re-audit before running.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

DRY_RUN=1
if [[ "${EXECUTE:-0}" == "1" ]]; then
  DRY_RUN=0
fi

run() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] $*"
  else
    echo "+ $*"
    eval "$*"
  fi
}

mkdirp() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "[dry-run] mkdir -p $1"
  else
    mkdir -p "$1"
  fi
}

# ----------------------------------------------------------------------
# 1. Root-level translated docs → i18n/<locale>/
# ----------------------------------------------------------------------
# NOTE: Per the audit report §6, the recommended path is to KEEP these in place
# and rely on the i18n-INDEX.md alternative. The moves below are provided for
# the deeply-reorganized scenario; un-comment with eyes open.

# mkdirp "i18n/de"
# mkdirp "i18n/zh-CN"
# mkdirp "i18n/zh-TW"
# mkdirp "i18n/ja"
# mkdirp "i18n/ko"

# run "git mv README.de.md            i18n/de/README.md"
# run "git mv CONTRIBUTING.de.md      i18n/de/CONTRIBUTING.md"
# run "git mv QUICKSTART.de.md        i18n/de/QUICKSTART.md"
# run "git mv README.zh-CN.md         i18n/zh-CN/README.md"
# run "git mv CONTRIBUTING.zh-CN.md   i18n/zh-CN/CONTRIBUTING.md"
# run "git mv README.zh-TW.md         i18n/zh-TW/README.md"
# run "git mv README.ja-JP.md         i18n/ja/README.md"
# run "git mv CONTRIBUTING.ja-JP.md   i18n/ja/CONTRIBUTING.md"
# run "git mv QUICKSTART.ja-JP.md     i18n/ja/QUICKSTART.md"
# run "git mv README.ko.md            i18n/ko/README.md"

# ----------------------------------------------------------------------
# 2. Secondary intermingling — translated docs nested in packages
#    (these are higher-confidence moves: no English siblings exist)
# ----------------------------------------------------------------------

mkdirp "i18n/zh-CN/skills/html-ppt"
run "git mv skills/html-ppt/README.zh-CN.md i18n/zh-CN/skills/html-ppt/README.md"

mkdirp "i18n/zh-CN/e2e/cases"
mkdirp "i18n/zh-CN/e2e/cases/modules"
mkdirp "i18n/zh-CN/e2e/reports"
run "git mv e2e/cases/README.zh-CN.md            i18n/zh-CN/e2e/cases/README.md"
run "git mv e2e/reports/README.zh-CN.md          i18n/zh-CN/e2e/reports/README.md"
# These three are Chinese-only without locale suffix — move + rename in one step:
run "git mv e2e/cases/modules/files.md                  i18n/zh-CN/e2e/cases/modules/files.md"
run "git mv e2e/cases/modules/conversations.md          i18n/zh-CN/e2e/cases/modules/conversations.md"
run "git mv e2e/cases/modules/project-and-generation.md i18n/zh-CN/e2e/cases/modules/project-and-generation.md"

# ----------------------------------------------------------------------
# 3. Vendored CJK-origin skill — DO NOT MOVE
# ----------------------------------------------------------------------
# skills/guizang-ppt/ is a vendored upstream from github.com/op7418/guizang-ppt-skill.
# Moving it breaks (a) the daemon's skill-discovery path, (b) the upstream
# sync workflow, (c) every internal reference inside the skill bundle.
# Recommendation in audit §5 is to mark it as `language: zh-CN-primary` in
# metadata, not relocate. No moves emitted here.

# ----------------------------------------------------------------------
# 4. Link rewrites (DO NOT RUN until reviewed)
# ----------------------------------------------------------------------
# After moves, every locale-switcher and inline cross-reference needs an update.
# The sed pass below is illustrative — REVIEW each pattern on one file before
# applying repo-wide. Macro pattern: `README.<code>.md` → `i18n/<code>/README.md`.
#
# # On every English README/CONTRIBUTING/QUICKSTART at root:
# sed -i \
#   -e 's|href="README\.de\.md"|href="i18n/de/README.md"|g' \
#   -e 's|href="README\.zh-CN\.md"|href="i18n/zh-CN/README.md"|g' \
#   -e 's|href="README\.zh-TW\.md"|href="i18n/zh-TW/README.md"|g' \
#   -e 's|href="README\.ja-JP\.md"|href="i18n/ja/README.md"|g' \
#   -e 's|href="README\.ko\.md"|href="i18n/ko/README.md"|g' \
#   -e 's|href="CONTRIBUTING\.de\.md"|href="i18n/de/CONTRIBUTING.md"|g' \
#   -e 's|href="CONTRIBUTING\.zh-CN\.md"|href="i18n/zh-CN/CONTRIBUTING.md"|g' \
#   -e 's|href="CONTRIBUTING\.ja-JP\.md"|href="i18n/ja/CONTRIBUTING.md"|g' \
#   -e 's|href="QUICKSTART\.de\.md"|href="i18n/de/QUICKSTART.md"|g' \
#   -e 's|href="QUICKSTART\.ja-JP\.md"|href="i18n/ja/QUICKSTART.md"|g' \
#   README.md CONTRIBUTING.md QUICKSTART.md AGENTS.md TRANSLATIONS.md
#
# # AGENTS.md uses bare backticked filenames (not href), patch separately:
# sed -i \
#   -e 's|`README\.zh-CN\.md`|`i18n/zh-CN/README.md`|g' \
#   -e 's|`CONTRIBUTING\.zh-CN\.md`|`i18n/zh-CN/CONTRIBUTING.md`|g' \
#   AGENTS.md
#
# # Inside translated docs, sibling switcher links also need rewriting — these
# # have already moved, so update them in place at the new path:
# sed -i 's|href="README\.de\.md"|href="../de/README.md"|g' i18n/zh-CN/README.md i18n/zh-TW/README.md i18n/ja/README.md i18n/ko/README.md
# # ... etc. for each combination. Author the full matrix as a per-locale loop.
#
# # Fix the broken absolute path in e2e/cases/README.zh-CN.md (line 22):
# sed -i 's|/Users/mac/open-design/open-design/e2e/reports/README\.zh-CN\.md|../reports/README.md|g' i18n/zh-CN/e2e/cases/README.md

# ----------------------------------------------------------------------
# 5. Manifest (proposed, write once)
# ----------------------------------------------------------------------
# Write i18n/README.md as the locale index — list every locale, link to its
# README and to the canonical English source. Do this as a Markdown file via
# whatever editor / script; not automated here.

if [[ $DRY_RUN -eq 1 ]]; then
  echo
  echo "Dry-run complete. Re-run with EXECUTE=1 to actually move files."
  echo "Reminder: link rewrites are intentionally COMMENTED OUT in this script."
fi
