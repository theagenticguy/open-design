# Translations

The canonical source for every doc in this repo is the English version at the repo root (`README.md`, `CONTRIBUTING.md`, `QUICKSTART.md`, `AGENTS.md`). Translations live here, one directory per locale.

## Locales

| Code | Language | Docs |
|------|----------|------|
| `de` | Deutsch | [README](de/README.md) · [CONTRIBUTING](de/CONTRIBUTING.md) · [QUICKSTART](de/QUICKSTART.md) |
| `zh-CN` | 简体中文 | [README](zh-CN/README.md) · [CONTRIBUTING](zh-CN/CONTRIBUTING.md) |
| `zh-TW` | 繁體中文 | [README](zh-TW/README.md) |
| `ja` | 日本語 | [README](ja/README.md) · [CONTRIBUTING](ja/CONTRIBUTING.md) · [QUICKSTART](ja/QUICKSTART.md) |
| `ko` | 한국어 | [README](ko/README.md) |

UI dictionaries for `apps/web` live separately at `apps/web/src/i18n/locales/<code>.ts` — those are typed and stay in place.

## Authoring rules

- English at the repo root is canonical. Translate from there.
- Sibling switcher links in each translated doc point at `../<other-locale>/README.md`. Update them when adding a locale.
- See [`../TRANSLATIONS.md`](../TRANSLATIONS.md) for the policy: drift threshold, stale handling, native-speaker review, terminology glossary.
- The vendored skill at `skills/guizang-ppt/` is CJK-origin and stays in place — moving it breaks daemon discovery and upstream sync.
