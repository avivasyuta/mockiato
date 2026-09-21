#!/usr/bin/env node
// Generates a static, shields.io-style SVG coverage badge from vitest's
// coverage-summary.json, without hitting any external service. The output is
// committed to the `badges` branch (see .github/workflows/coverage-badge.yml)
// and referenced from README.md via a raw.githubusercontent.com URL.
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

import { renderBadge } from './lib/badge.mjs';

const SUMMARY_PATH = path.resolve('coverage/coverage-summary.json');
const OUTPUT_DIR = path.resolve('badges');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'coverage.svg');

const getColor = (pct) => {
  if (pct >= 90) return '#4c1';
  if (pct >= 80) return '#97ca00';
  if (pct >= 70) return '#a4a61d';
  if (pct >= 50) return '#dfb317';
  if (pct >= 30) return '#fe7d37';
  return '#e05d44';
};

const main = async () => {
  const summaryRaw = await readFile(SUMMARY_PATH, 'utf-8');
  const summary = JSON.parse(summaryRaw);
  const pct = Math.round(summary.total.lines.pct * 10) / 10;

  const svg = renderBadge('coverage', `${pct}%`, getColor(pct));

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, svg, 'utf-8');

  console.log(`Coverage badge written to ${OUTPUT_PATH} (${pct}%)`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
