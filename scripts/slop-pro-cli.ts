#!/usr/bin/env -S node --experimental-strip-types
/**
 * Tier-2 anti-slop bridge — composes the Tier-1 deterministic linter
 * with the prose-check Tier-2 dual-judge (Nova 2 Lite + Haiku 4.5 via
 * Bedrock + paraphrase probe).
 *
 * The Tier-2 pipeline is owned by personal-plugins/skills/prose-check.
 * This wrapper does NOT reimplement it — it extracts the visible body
 * text from the rendered HTML, writes it to a temp file, and shells
 * out to `prose_check_pro.py --json`.
 *
 * Composite scoring (matches prose-check Tier 2):
 *   final = 0.40 * deterministic + 0.50 * judge_consensus + 0.10 * paraphrase_signal
 *
 * Usage:
 *   LAITH_SLOP_PRO=1 node --experimental-strip-types scripts/slop-pro-cli.ts <file.html>
 *
 * Env:
 *   LAITH_SLOP_PRO=1        gate the LLM judges (cost / latency)
 *   AWS_PROFILE             defaults to lalsaado-handson
 *   PROSE_CHECK_PRO_PATH    overrides the prose-check Tier-2 script path
 *
 * Exit codes:
 *   0   composite score < 25 (clean)
 *   1   composite score 25-55 (revise)
 *   2   composite score >= 55 (rewrite)
 *   3   wiring or auth error (treated as caller's problem)
 */

import { readFile, writeFile, mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, '..');

const PROSE_CHECK_PRO_PATH =
  process.env.PROSE_CHECK_PRO_PATH ??
  '/efs/lalsaado/workplace/personal-plugins/personal-plugins/skills/prose-check/scripts/prose_check_pro.py';

const AWS_PROFILE = process.env.AWS_PROFILE ?? 'lalsaado-handson';

interface Tier1Finding {
  severity: 'P0' | 'P1' | 'P2';
  id: string;
  message: string;
  fix: string;
  snippet?: string;
}

interface Tier2Result {
  composite_score: number;
  ai_likelihood?: number | undefined;
  slop_score?: number | undefined;
  dimensions?: Record<string, number> | undefined;
  top_violations?: string[] | undefined;
  judges?: Record<string, unknown> | undefined;
  paraphrase?: { jaccard_overlap?: number; signal?: number } | undefined;
  deterministic?: { score: number } | undefined;
}

/** Strip HTML to a plain-text rendering of visible body content. */
function htmlToVisibleText(html: string): string {
  let s = html;
  // Drop scripts, styles, head — order matters.
  s = s.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ');
  s = s.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, ' ');
  s = s.replace(/<head\b[^>]*>[\s\S]*?<\/head>/gi, ' ');
  s = s.replace(/<noscript\b[^>]*>[\s\S]*?<\/noscript>/gi, ' ');
  s = s.replace(/<svg\b[^>]*>[\s\S]*?<\/svg>/gi, ' ');
  // Drop HTML comments.
  s = s.replace(/<!--[\s\S]*?-->/g, ' ');
  // Replace block-level closes with newlines so paragraphs survive.
  s = s.replace(/<\/(p|div|section|article|header|footer|nav|main|aside|li|h[1-6]|blockquote|tr)>/gi, '\n');
  s = s.replace(/<br\s*\/?>/gi, '\n');
  // Drop remaining tags.
  s = s.replace(/<[^>]+>/g, ' ');
  // Decode the most common entities.
  const entities: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
    '&apos;': "'",
    '&nbsp;': ' ',
    '&mdash;': '—',
    '&ndash;': '–',
    '&hellip;': '…',
  };
  s = s.replace(/&(amp|lt|gt|quot|#39|apos|nbsp|mdash|ndash|hellip);/g, (m) => entities[m] ?? m);
  // Collapse whitespace per-line, then collapse blank-line runs.
  s = s
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .join('\n');
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}

interface Tier1RunResult {
  findings: Tier1Finding[];
  p0Count: number;
  p1Count: number;
  p2Count: number;
}

async function runTier1(html: string): Promise<Tier1RunResult> {
  const distPath = resolve(repoRoot, 'apps', 'daemon', 'dist', 'lint-artifact.js');
  const mod = (await import(distPath)) as { lintArtifact: (h: string) => Tier1Finding[] };
  const findings = mod.lintArtifact(html);
  return {
    findings,
    p0Count: findings.filter((f) => f.severity === 'P0').length,
    p1Count: findings.filter((f) => f.severity === 'P1').length,
    p2Count: findings.filter((f) => f.severity === 'P2').length,
  };
}

interface ProseCheckProJson {
  composite?: { final_score?: number };
  judges?: Record<string, unknown>;
  paraphrase?: { jaccard_overlap?: number };
  deterministic?: { score?: number };
  ai_likelihood?: number;
  slop_score?: number;
  dimensions?: Record<string, number>;
  top_violations?: string[];
  [key: string]: unknown;
}

async function runProseCheckPro(textPath: string): Promise<ProseCheckProJson> {
  return new Promise((resolveP, rejectP) => {
    const args = ['run', PROSE_CHECK_PRO_PATH, textPath, '--json'];
    const env = { ...process.env, AWS_PROFILE };
    const proc = spawn('uv', args, { env, stdio: ['ignore', 'pipe', 'pipe'] });
    const out: Buffer[] = [];
    const err: Buffer[] = [];
    proc.stdout.on('data', (chunk: Buffer) => out.push(chunk));
    proc.stderr.on('data', (chunk: Buffer) => err.push(chunk));
    proc.on('error', (e) => rejectP(new Error(`failed to spawn uv: ${e.message}`)));
    proc.on('close', (code) => {
      const stdout = Buffer.concat(out).toString('utf8');
      const stderr = Buffer.concat(err).toString('utf8');
      if (code !== 0) {
        rejectP(
          new Error(
            `prose_check_pro.py exited ${code}\n--- stderr ---\n${stderr}\n--- stdout ---\n${stdout.slice(0, 2000)}`,
          ),
        );
        return;
      }
      try {
        // The script may emit a rich-text panel before the JSON; find the first '{'.
        const jsonStart = stdout.indexOf('{');
        const json = jsonStart >= 0 ? stdout.slice(jsonStart) : stdout;
        resolveP(JSON.parse(json) as ProseCheckProJson);
      } catch (e) {
        rejectP(new Error(`failed to parse prose_check_pro JSON: ${e}\n${stdout.slice(0, 500)}`));
      }
    });
  });
}

function compositeScore(tier1: Tier1RunResult, tier2: ProseCheckProJson): Tier2Result {
  // prose-check Tier 2's own composite already weights the three layers.
  // When it ran cleanly, take its final score directly.
  const proseCheckFinal =
    typeof tier2.composite?.final_score === 'number' ? tier2.composite.final_score : null;

  // Boost the composite by Tier-1 visual findings the prose pipeline can't see.
  // P0 = 8 points each, P1 = 3, P2 = 1 (cap at 30).
  const visualBoost = Math.min(30, tier1.p0Count * 8 + tier1.p1Count * 3 + tier1.p2Count);

  const final = proseCheckFinal !== null ? Math.min(100, proseCheckFinal + visualBoost) : visualBoost;

  return {
    composite_score: Math.round(final),
    ai_likelihood: tier2.ai_likelihood,
    slop_score: tier2.slop_score,
    dimensions: tier2.dimensions,
    top_violations: tier2.top_violations,
    judges: tier2.judges,
    paraphrase: tier2.paraphrase,
    deterministic: tier2.deterministic
      ? { score: tier2.deterministic.score ?? 0 }
      : undefined,
  };
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let path: string | undefined;
  let asJson = true;
  let dryRun = false;
  for (const a of args) {
    if (a === '--text' || a === '-t') asJson = false;
    else if (a === '--dry-run') dryRun = true;
    else if (a === '--help' || a === '-h') {
      console.log(
        'slop-pro-cli — Tier-1 + Tier-2 composite anti-slop check\n\n' +
          'Usage:\n' +
          '  LAITH_SLOP_PRO=1 node --experimental-strip-types scripts/slop-pro-cli.ts [--text|--dry-run] <file.html>\n\n' +
          'Tier 1 always runs (deterministic, no LLM cost).\n' +
          'Tier 2 runs only when LAITH_SLOP_PRO=1 (shells to prose_check_pro.py via uv).\n' +
          '--dry-run skips the LLM call and reports Tier-1 only with visual boost as the score.\n\n' +
          'Exit codes: 0 clean (<25), 1 revise (25-55), 2 rewrite (>=55), 3 wiring error.',
      );
      process.exit(0);
    } else if (!path) path = a;
  }

  if (!path) {
    console.error('error: pass an HTML file. --help for usage.');
    process.exit(3);
  }

  let html: string;
  try {
    html = await readFile(path, 'utf8');
  } catch (e) {
    console.error(`error: cannot read ${path}: ${e instanceof Error ? e.message : e}`);
    process.exit(3);
  }

  // Tier 1 — always.
  const tier1 = await runTier1(html);

  const wantTier2 = process.env.LAITH_SLOP_PRO === '1' && !dryRun;

  let tier2: ProseCheckProJson = {};
  if (wantTier2) {
    const text = htmlToVisibleText(html);
    if (text.length < 30) {
      console.error('warning: extracted body text under 30 chars — skipping Tier 2.');
    } else {
      const tmp = await mkdtemp(join(tmpdir(), 'slop-pro-'));
      const txtPath = join(tmp, 'visible.txt');
      await writeFile(txtPath, text, 'utf8');
      try {
        tier2 = await runProseCheckPro(txtPath);
      } catch (e) {
        console.error(`error: Tier 2 failed: ${e instanceof Error ? e.message : e}`);
        if (asJson) {
          process.stdout.write(
            JSON.stringify(
              {
                composite_score: tier1.p0Count > 0 ? 60 : tier1.p1Count > 0 ? 35 : 10,
                tier1,
                tier2_error: e instanceof Error ? e.message : String(e),
              },
              null,
              2,
            ) + '\n',
          );
        }
        process.exit(3);
      }
    }
  }

  const composite = compositeScore(tier1, tier2);

  if (asJson) {
    process.stdout.write(
      JSON.stringify(
        {
          composite,
          tier1,
          tier2: wantTier2 ? tier2 : { skipped: dryRun ? 'dry-run' : 'LAITH_SLOP_PRO not set' },
        },
        null,
        2,
      ) + '\n',
    );
  } else {
    console.log(`Composite slop score: ${composite.composite_score}/100`);
    console.log(`  Tier 1: ${tier1.p0Count} P0, ${tier1.p1Count} P1, ${tier1.p2Count} P2`);
    if (wantTier2 && composite.ai_likelihood !== undefined) {
      console.log(`  Tier 2: ai_likelihood=${composite.ai_likelihood}%, slop_score=${composite.slop_score}/100`);
      if (composite.top_violations?.length) {
        console.log(`  Top violations: ${composite.top_violations.slice(0, 3).join('; ')}`);
      }
    }
  }

  const score = composite.composite_score;
  process.exit(score < 25 ? 0 : score < 55 ? 1 : 2);
}

void main();
