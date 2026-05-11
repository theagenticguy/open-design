#!/usr/bin/env bash
# Idempotent translation scrub. Re-runs the moves the initial reorg made,
# in case upstream re-introduces root-level translation files. Safe to run
# repeatedly: every operation checks the source path exists first.
#
# Run from repo root. No-op when the tree is already clean.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

mv_if_exists() {
  local src="$1"
  local dst="$2"
  if [[ -f "$src" ]]; then
    mkdir -p "$(dirname "$dst")"
    git mv "$src" "$dst"
    echo "  moved: $src -> $dst"
  fi
}

# Root translations
mv_if_exists "README.de.md"            "i18n/de/README.md"
mv_if_exists "CONTRIBUTING.de.md"      "i18n/de/CONTRIBUTING.md"
mv_if_exists "QUICKSTART.de.md"        "i18n/de/QUICKSTART.md"
mv_if_exists "README.zh-CN.md"         "i18n/zh-CN/README.md"
mv_if_exists "CONTRIBUTING.zh-CN.md"   "i18n/zh-CN/CONTRIBUTING.md"
mv_if_exists "README.zh-TW.md"         "i18n/zh-TW/README.md"
mv_if_exists "README.ja-JP.md"         "i18n/ja/README.md"
mv_if_exists "CONTRIBUTING.ja-JP.md"   "i18n/ja/CONTRIBUTING.md"
mv_if_exists "QUICKSTART.ja-JP.md"     "i18n/ja/QUICKSTART.md"
mv_if_exists "README.ko.md"            "i18n/ko/README.md"

# Nested translations
mv_if_exists "skills/html-ppt/README.zh-CN.md" "i18n/zh-CN/skills/html-ppt/README.md"
mv_if_exists "e2e/cases/README.zh-CN.md"       "i18n/zh-CN/e2e/cases/README.md"
mv_if_exists "e2e/reports/README.zh-CN.md"     "i18n/zh-CN/e2e/reports/README.md"

echo "✔ Translation scrub idempotent run complete."
