# Open Design Monorepo — Language Distribution Audit

**Repo:** `/home/lalsaado/workplace/open-design`
**Date:** 2026-05-11
**Scope:** identify English-only vs. non-English assets, propose a parallel-locale tree without moving anything.

---

## 1. Summary

- **Files in scope (excluding `node_modules`, `dist/`, `.tmp/`, `.od/`, `.audit/`):** ~1,594 total; ~805 scannable text.
- **Root-level translated docs (intermingled, primary target):** 10 (README ×5, CONTRIBUTING ×3, QUICKSTART ×2).
- **UI dictionaries (already organized):** 13 in `apps/web/src/i18n/locales/`.
- **Translated docs nested in packages (secondary target):** 3 (`skills/html-ppt/README.zh-CN.md`, `e2e/cases/README.zh-CN.md`, `e2e/reports/README.zh-CN.md`).
- **Vendored CJK-origin skill (special case):** `skills/guizang-ppt/` — 7 files, 28–30% CJK throughout.
- **Other CJK-heavy non-locale files:** ~15 `skills/html-ppt/templates/full-decks/*/README.md` template demos; 3 e2e Chinese-authored files (`e2e/cases/modules/*.md`); `e2e/cases/report-metadata.ts`.
- **Legitimate bilingual hits:** `TRANSLATIONS.md`, locale-switcher headers, classifier regexes in `apps/daemon/src/skills.ts`, sanitizer fixtures, 3 `design-systems/*/DESIGN.md`, NSIS Persian in `tools/pack/src/win.ts`, `apps/web/src/i18n/types.ts`.

---

## 2. Root-level translated docs (intermingled — primary target)

| File | Locale | English counterpart | Referenced by |
|---|---|---|---|
| `README.de.md` | de | `README.md` | `README.md:349`, `README.zh-CN.md:348`, `README.zh-TW.md:347`, `README.ja-JP.md:348`, `README.ko.md:346`, `CONTRIBUTING.md:19`, `CONTRIBUTING.de.md:19`, `CONTRIBUTING.zh-CN.md:19`; locale-switcher header in every README |
| `README.zh-CN.md` | zh-CN | `README.md` | `README.md:350`, `README.de.md:349`, `README.zh-TW.md`, `README.ja-JP.md:349`, `README.ko.md:347`, `CONTRIBUTING.md:19`, `CONTRIBUTING.de.md:19`, `CONTRIBUTING.zh-CN.md:19`, `CONTRIBUTING.ja-JP.md:19`, **`AGENTS.md:7`**, `TRANSLATIONS.md:36` |
| `README.zh-TW.md` | zh-TW | `README.md` | locale-switcher header in every README; `TRANSLATIONS.md` |
| `README.ko.md` | ko | `README.md` | locale-switcher header in every README; `TRANSLATIONS.md:33` |
| `README.ja-JP.md` | ja | `README.md` | locale-switcher header in every README; `TRANSLATIONS.md:32` |
| `CONTRIBUTING.de.md` | de | `CONTRIBUTING.md` | locale-switcher header in every CONTRIBUTING; `README.de.md:692` |
| `CONTRIBUTING.zh-CN.md` | zh-CN | `CONTRIBUTING.md` | locale-switcher header; `README.md:696`, `README.zh-CN.md:688`, `README.zh-TW.md:614`, `README.ko.md:690`, **`AGENTS.md:8`** |
| `CONTRIBUTING.ja-JP.md` | ja | `CONTRIBUTING.md` | locale-switcher header; `README.ja-JP.md:689` |
| `QUICKSTART.de.md` | de | `QUICKSTART.md` | locale-switcher header in every QUICKSTART; `README.de.md:313`, `README.de.md:341` |
| `QUICKSTART.ja-JP.md` | ja | `QUICKSTART.md` | locale-switcher header in every QUICKSTART |

**Reference touchpoints to update on move:** locale-switcher `<a href>` in 11 root docs; explicit references in `AGENTS.md` (lines 7–8) and 8+ inline links inside translated READMEs / CONTRIBUTINGs. `CLAUDE.md` does NOT reference these files.

---

## 3. UI dictionaries (already organized — leave in place)

`apps/web/src/i18n/locales/` (13 files): `en.ts`, `de.ts`, `es-ES.ts`, `fa.ts`, `hu.ts`, `ja.ts`, `ko.ts`, `pl.ts`, `pt-BR.ts`, `ru.ts`, `tr.ts`, `zh-CN.ts`, `zh-TW.ts`. Type definitions and label maps live in `apps/web/src/i18n/types.ts`. This is the canonical pattern — already file-per-locale, not intermingled. **Leave alone.**

Note: `tr.ts` and `pl.ts` exist as locales but `TRANSLATIONS.md` does not list them in the maintained set — flag as a metadata drift, but out of scope for this audit.

---

## 4. Non-English content embedded in otherwise-English files

### 4a. Legitimate bilingual content (flag, do not move)

| File | Why legitimate | Recommendation |
|---|---|---|
| `TRANSLATIONS.md` | The locale registry itself — has the zh-CN ↔ zh-TW glossary, locale labels in native script. | Keep at root. |
| Locale-switcher `<a>` headers in every `README*.md`, `CONTRIBUTING*.md`, `QUICKSTART*.md` | Each header lists all sibling locales by native name (`简体中文`, `繁體中文`, `한국어`, `日本語`, `Deutsch`). | Keep the bilingual header. **Update the `href`s when files move** (see §6). |
| `apps/web/src/i18n/types.ts:7-20` | `LOCALE_LABEL` map of `Locale → native name`. By definition mixed. | Keep. |
| `apps/web/src/i18n/locales.test.ts:32` | Asserts `ja → '日本語'`. | Keep. |
| `apps/daemon/src/skills.ts:180-207` | Classifier regexes that match Chinese keywords (`图片`, `海报`, `视频`, `音频`, etc.) for skill routing — semantic, not translatable. | Keep. |
| `apps/daemon/src/projects.ts:203` | Bug-context comment about Chinese filename sanitization. | Keep. |
| `apps/daemon/tests/sanitize-name.test.ts` | Test fixtures that assert CJK filenames survive sanitization (`测试文档-中文文件名.docx`, `資料.pdf`). | Keep. |
| `tools/pack/src/win.ts:304-318` | NSIS installer Persian (`fa-IR` / LCID 1065) localized strings — required by Windows installer i18n. | Keep. |
| `design-systems/xiaohongshu/DESIGN.md` | Brand-vocabulary mentions of 小红书, PingFang SC, 方正悠黑, slogan `你的生活兴趣社区`. Inline glosses in English. | Keep — design-system documents real CJK type stack. |
| `design-systems/pinterest/DESIGN.md:61` | Japanese / CJK font fallbacks in `font-family` chain (`ヒラギノ角ゴ Pro W3`). | Keep. |
| `design-systems/kami/DESIGN.md:1` | Japanese 紙 in heading; rest is English. | Keep. |
| `design-systems/README.md` | CJK indices in design-system list. | Keep. |
| `skills/hyperframes/references/tts.md:25` | TTS sample line `今日はいい天気ですね`. | Keep — example input. |
| ~30 `skills/*/SKILL.md` files | CJK trigger keywords in skill `triggers:` arrays for routing (`周报演示`, `目标`, `草稿`, `幻灯片`). Semantic routing tokens, not user-facing prose. | Keep. |
| `skills/html-ppt/templates/full-decks/*/index.html`, `README.md` (15 dirs) | Slide-template demo content uses CJK sample copy by design (e.g. `xhs-post`, `xhs-white-editorial`, `presenter-mode-reveal`). | Keep — vendored template content. Document as "sample content may be CJK by template author's choice." |

### 4b. Real intermingling (recommend split / locale)

| File | Issue | Recommendation |
|---|---|---|
| `e2e/cases/README.zh-CN.md` | Properly suffixed but no English counterpart at `e2e/cases/README.md`. References `/Users/mac/open-design/open-design/e2e/reports/README.zh-CN.md` (broken absolute path). | **Split**: author `e2e/cases/README.md` in English (canonical), keep `.zh-CN` as translation. Move under `i18n/zh-CN/e2e/cases/` if reorganizing. Fix broken absolute path. |
| `e2e/reports/README.zh-CN.md` | Same as above — Chinese-only, no English sibling. | **Split**: write English `README.md`. |
| `e2e/cases/modules/files.md`, `conversations.md`, `project-and-generation.md` | All-Chinese authored docs with no `.md` locale suffix and no English counterpart. ~30–41% CJK. **This is the worst intermingling case** — locale is not declared in the filename or content. | **Move + rename**: `e2e/cases/modules/zh-CN/files.md` (or `i18n/zh-CN/e2e/cases/modules/files.md`), then add English `e2e/cases/modules/files.md` as canonical. |
| `e2e/cases/report-metadata.ts` | TS literals like `'项目创建与生成'`, `'可以创建 prototype 项目并进入工作区'` — user-visible report metadata, not classifier tokens. | **Split**: extract `metadata.zh-CN.json` or route through `apps/web/src/i18n/locales/`, keep English default. Lower priority. |
| `skills/html-ppt/README.zh-CN.md` | Properly suffixed; English sibling exists. Same shape as root. | **Move** to `i18n/zh-CN/skills/html-ppt/README.md`. |

---

## 5. The `skills/guizang-ppt/` case

`guizang-ppt` is a **vendored CJK-origin AgentSkill** (upstream: `https://github.com/op7418/guizang-ppt-skill`). Author is "歸藏" (Guizang). The skill ships under MIT, with a dual-language doc set:

- `SKILL.md` — 30% CJK; Chinese description + bilingual triggers (`"杂志"`, `"horizontal swipe"`, `"网页 PPT"`). The frontmatter `description:` is Chinese, which means the skill's discoverability text is non-English. The `od.example_prompt` is also Chinese.
- `README.md` — 28% CJK; Chinese-primary, links to `README.en.md` for English.
- `README.en.md` — 0% CJK; full English translation.
- `references/checklist.md`, `components.md`, `layouts.md`, `styles.md`, `themes.md` — all 13–30% CJK; technical content with bilingual section headings + Chinese commentary.
- `assets/example-slides.html`, `template.html` — demo HTML, includes CJK sample copy.
- `LICENSE` — MIT, English.

**Recommendation (do not act):** Mark as `language: zh-CN-primary` in `od.upstream` metadata (or add a `LOCALES.md` index inside the skill). Do **not** relocate to `skills/zh-CN/guizang-ppt/` — breaks the daemon's skill-discovery path, upstream sync, and internal references. Treat `README.en.md` as a translation artifact, not canonical. The daemon's classifier already recognizes the Chinese triggers — routing is intentional. Optional cleanup: rotate `SKILL.md` `description:` to English-primary with a `(中文版本见 README.md)` line, preserving Anglophone discoverability without breaking upstream sync.

---

## 6. Reorganization proposal

### Target layout

```
i18n/
  README.md                 ← manifest: locale list + canonical-English link
  de/
    README.md               ← was: ./README.de.md
    CONTRIBUTING.md         ← was: ./CONTRIBUTING.de.md
    QUICKSTART.md           ← was: ./QUICKSTART.de.md
  zh-CN/
    README.md               ← was: ./README.zh-CN.md
    CONTRIBUTING.md         ← was: ./CONTRIBUTING.zh-CN.md
    skills/html-ppt/README.md  ← was: ./skills/html-ppt/README.zh-CN.md
    e2e/
      cases/README.md       ← was: ./e2e/cases/README.zh-CN.md
      cases/modules/{files,conversations,project-and-generation}.md  ← was: e2e/cases/modules/*.md (which are ZH-only)
      reports/README.md     ← was: ./e2e/reports/README.zh-CN.md
  zh-TW/
    README.md               ← was: ./README.zh-TW.md
  ja/
    README.md               ← was: ./README.ja-JP.md  (note: rename ja-JP → ja to match LOCALES type)
    CONTRIBUTING.md         ← was: ./CONTRIBUTING.ja-JP.md
    QUICKSTART.md           ← was: ./QUICKSTART.ja-JP.md
  ko/
    README.md               ← was: ./README.ko.md
```

**Cross-link updates required (sed pass):**

- `README.de.md` style links → `i18n/de/README.md` (relative from root: `./i18n/de/README.md`).
- `CONTRIBUTING.zh-CN.md` → `i18n/zh-CN/CONTRIBUTING.md`.
- `AGENTS.md` lines 7–8 (only file outside translated docs that hardcodes the paths).
- Inline references inside every translated doc to siblings — re-author the locale-switcher block.

**Leave untouched:** `apps/web/src/i18n/locales/` (already file-per-locale), `apps/web/src/i18n/types.ts`, `TRANSLATIONS.md` (root-level policy doc — update its file-path column to point at the new tree).

### Trade-off: upstream-sync friction

The translated root READMEs follow the **upstream `README.<code>.md` convention** that GitHub's locale-aware UI auto-detects. Moving them to `i18n/<locale>/README.md` breaks GitHub's automatic locale switcher and means every upstream-doc sync has to remap paths.

Commit churn on these files:

```
$ git log --oneline --all -- README.zh-CN.md README.de.md README.ja-JP.md \
    README.ko.md README.zh-TW.md CONTRIBUTING.de.md CONTRIBUTING.zh-CN.md \
    CONTRIBUTING.ja-JP.md QUICKSTART.de.md QUICKSTART.ja-JP.md | wc -l
39
```

39 commits across the lifetime of these files — moderate churn (~1/week-ish in the active period). Each future translation update PR will need a path-aware reviewer, and any external contributor familiar with the GitHub convention will get confused.

### Alternative (lower-risk)

Keep root translated docs in place. Add `docs/i18n-INDEX.md` listing every translated artifact with locale, canonical English source, and last-sync date. Lean on the existing `TRANSLATIONS.md` policy. **Pros:** zero upstream-sync friction, no link rewrites, GitHub auto-discovery still works. **Cons:** does not satisfy the "deeply reorganize so non-English doesn't intermingle with English" goal.

**Recommendation:** use the alternative (index file + TRANSLATIONS.md) for **root docs**, but **do** apply the move for the secondary intermingling cases — `skills/html-ppt/README.zh-CN.md`, `e2e/cases/README.zh-CN.md`, `e2e/reports/README.zh-CN.md`, `e2e/cases/modules/*.md` (these have no English siblings; they are accidentally Chinese-only).

---

## 7. Shell move script (proposed, do not run)

See `/home/lalsaado/workplace/open-design/.audit/move-non-english.sh`. It is a `git mv`-based dry-run with explicit `--dry-run` flag default. The link-rewrite step is sketched as a sed block but commented out — apply only after a human review of the regex and a test on one file.
