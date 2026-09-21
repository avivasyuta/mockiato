#!/usr/bin/env node
// Generates a static, shields.io-style SVG rating badge for the Chrome Web
// Store listing, without depending on shields.io. shields.io's own
// chrome-web-store/users badge is permanently broken: the current Chrome Web
// Store listing page no longer publishes an install/user count at all, so
// there is nothing left to scrape for it. The rating and rating count are
// still shown on the listing, so we render those with a real browser
// (the page needs JS to render) instead.
//
// The output is committed to the `badges` branch (see
// .github/workflows/chrome-store-badge.yml, run on a schedule since the
// rating doesn't change on every push) and referenced from README.md via a
// raw.githubusercontent.com URL.
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import { chromium } from '@playwright/test';

import { renderBadge } from './lib/badge.mjs';

const STORE_URL = 'https://chromewebstore.google.com/detail/mockiato-mocks-on-the-fly/ilbkkhmnmnehcicempfpekgcpneeekao';
const OUTPUT_DIR = path.resolve('badges');
const OUTPUT_PATH = path.join(OUTPUT_DIR, 'chrome-store-rating.svg');

const getColor = (rating) => {
  if (rating >= 4.5) return '#4c1';
  if (rating >= 4.0) return '#97ca00';
  if (rating >= 3.0) return '#dfb317';
  return '#e05d44';
};

const scrapeRating = async () => {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(STORE_URL, { waitUntil: 'networkidle' });

    // The overall rating is rendered with an aria-label like
    // "4.9 out of 5 stars" (no leading "Average rating" / no trailing period,
    // which is how the per-review scores on the same page are labelled).
    // These callbacks run inside the browser page, not Node, hence `document`.
    /* eslint-disable no-undef */
    const ratingText = await page.evaluate(() => {
      const nodes = Array.from(document.querySelectorAll('[aria-label]'));
      const match = nodes.find((node) => /^[\d.]+ out of 5 stars$/.test(node.getAttribute('aria-label') ?? ''));
      return match?.getAttribute('aria-label') ?? null;
    });

    const countText = await page.evaluate(() => {
      const match = document.body.innerText.match(/([\d,]+)\s+ratings?/i);
      return match?.[1] ?? null;
    });
    /* eslint-enable no-undef */

    if (!ratingText) {
      throw new Error('Could not find the overall rating on the Chrome Web Store page.');
    }

    const rating = parseFloat(ratingText);
    const count = countText ? parseInt(countText.replace(/,/g, ''), 10) : null;

    return { rating, count };
  } finally {
    await browser.close();
  }
};

const main = async () => {
  const { rating, count } = await scrapeRating();
  const value = count !== null ? `${rating} ★ (${count})` : `${rating} ★`;

  const svg = renderBadge('Chrome rating', value, getColor(rating));

  await mkdir(OUTPUT_DIR, { recursive: true });
  await writeFile(OUTPUT_PATH, svg, 'utf-8');

  console.log(`Chrome Web Store rating badge written to ${OUTPUT_PATH} (${value})`);
};

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
