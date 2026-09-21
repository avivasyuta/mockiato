// Renders a static, shields.io-style flat SVG badge without hitting any
// external service. Shared by the coverage and Chrome Web Store badge
// generators.

// Rough width estimate for Verdana 11px, close enough for a two-segment flat badge.
const textWidth = (text) => Math.round(text.length * 6.5 + 10);

export const renderBadge = (label, value, color) => {
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
