#!/usr/bin/env -S node --experimental-strip-types
/**
 * Daemon-free wrapper around the existing artifact linter.
 *
 * Imports `lintArtifact()` and `renderFindingsForAgent()` from the built
 * daemon dist and runs them against an HTML file passed as argv[2] (or
 * piped on stdin). Exits non-zero when any P0 finding is present.
 *
 * Usage:
 *   node --experimental-strip-types scripts/lint-artifact-cli.ts <file.html>
 *   cat foo.html | node --experimental-strip-types scripts/lint-artifact-cli.ts
 *   node --experimental-strip-types scripts/lint-artifact-cli.ts --json <file.html>
 *
 * Pre-req: the daemon dist must exist. Run from repo root once:
 *   pnpm --filter @open-design/daemon build
 *
 * The wrapper is intentionally daemon-free — it does not start the
 * server, touch SQLite, or open ports. Bridge skills consume it from
 * any cwd via the absolute path `~/workplace/open-design/scripts/...`.
 */

import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distPath = resolve(__dirname, '..', 'apps', 'daemon', 'dist', 'lint-artifact.js');

interface LintFinding {
  severity: 'P0' | 'P1' | 'P2';
  id: string;
  message: string;
  fix: string;
  snippet?: string;
}

type LintArtifactFn = (rawHtml: string) => LintFinding[];
type RenderFindingsFn = (findings: LintFinding[]) => string;

let lintArtifact: LintArtifactFn;
let renderFindingsForAgent: RenderFindingsFn;

try {
  const mod = (await import(distPath)) as {
    lintArtifact: LintArtifactFn;
    renderFindingsForAgent: RenderFindingsFn;
  };
  lintArtifact = mod.lintArtifact;
  renderFindingsForAgent = mod.renderFindingsForAgent;
} catch (err) {
  console.error(
    `error: failed to import lint-artifact from ${distPath}\n` +
      `  Run \`pnpm --filter @open-design/daemon build\` from the repo root first.\n` +
      `  Cause: ${err instanceof Error ? err.message : String(err)}`,
  );
  process.exit(2);
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  let asJson = false;
  let path: string | undefined;
  for (const arg of args) {
    if (arg === '--json' || arg === '-j') asJson = true;
    else if (arg === '--help' || arg === '-h') {
      console.log(
        'lint-artifact-cli — wraps lintArtifact() with no daemon\n\n' +
          'Usage:\n' +
          '  node --experimental-strip-types scripts/lint-artifact-cli.ts [--json] <file.html>\n' +
          '  cat foo.html | node --experimental-strip-types scripts/lint-artifact-cli.ts [--json]\n\n' +
          'Exits 0 when no P0 findings, 1 when P0 findings present, 2 on error.',
      );
      process.exit(0);
    } else if (!path) path = arg;
  }

  let html: string;
  if (path) {
    try {
      html = await readFile(path, 'utf8');
    } catch (err) {
      console.error(`error: cannot read ${path}: ${err instanceof Error ? err.message : err}`);
      process.exit(2);
    }
  } else if (!process.stdin.isTTY) {
    html = await readStdin();
  } else {
    console.error('error: pass an HTML file as argv[1] or pipe HTML on stdin. --help for usage.');
    process.exit(2);
  }

  const findings = lintArtifact(html);
  const p0Count = findings.filter((f) => f.severity === 'P0').length;
  const p1Count = findings.filter((f) => f.severity === 'P1').length;
  const p2Count = findings.filter((f) => f.severity === 'P2').length;

  if (asJson) {
    process.stdout.write(
      JSON.stringify(
        {
          summary: { p0: p0Count, p1: p1Count, p2: p2Count, total: findings.length },
          findings,
        },
        null,
        2,
      ) + '\n',
    );
  } else if (findings.length === 0) {
    console.log('✓ no findings');
  } else {
    process.stdout.write(renderFindingsForAgent(findings) + '\n');
    console.error(`\nsummary: ${p0Count} P0, ${p1Count} P1, ${p2Count} P2`);
  }

  process.exit(p0Count > 0 ? 1 : 0);
}

void main();
