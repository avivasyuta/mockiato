#!/usr/bin/env node
// Generates a static, shields.io-style SVG coverage badge from vitest's
// coverage-summary.json, without hitting any external service. The output is
// committed to the `badges` branch (see .github/workflows/coverage-badge.yml)
// and referenced from README.md via a raw.githubusercontent.com URL.
import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';

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

// Rough width estimate for Verdana 11px, close enough for a two-segment flat badge.
const textWidth = (text) => Math.round(text.length * 6.5 + 10);

const renderBadge = (label, value, color) => {
  const labelWidth = textWidth(label);
  const valueWidth = textWidth(value);
  const totalWidth = labelWidth + valueWidth;
  const labelX = labelWidth / 2;
  const valueX = labelWidth + valueWidth / 2;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${value}">
  <linearGradient id="s" x2="0" y2="100%">
    <stop offset="0" stop-color="#bbb" stop-opacity=".1"/>
    <stop offset="1" stop-opacity=".1"/>
  </linearGradient>
  <clipPath id="r">
    <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
  </clipPath>
  <g clip-path="url(#r)">
    <rect width="${labelWidth}" height="20" fill="#555"/>
    <rect x="${labelWidth}" width="${valueWidth}" height="20" fill="${color}"/>
    <rect width="${totalWidth}" height="20" fill="url(#s)"/>
  </g>
  <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" font-size="11">
    <text x="${labelX}" y="14">${label}</text>
    <text x="${valueX}" y="14">${value}</text>
  </g>
</svg>
`;
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
