// One-off: locate residual artifact pixels in generated brand assets.
// Classifies every pixel vs the flat brand blue and reports clusters of
// "other" (non-blue, non-white, non-red) pixels with bboxes.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const root = join(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const file = process.argv[2] ?? "assets/icon-only.png";
const png = PNG.sync.read(readFileSync(join(root, file)));
const { width: W, height: H, data } = png;

const BRAND = [1, 72, 164]; // #0148A4
const near = (r, g, b, [R, G, B], tol) =>
  Math.abs(r - R) <= tol && Math.abs(g - G) <= tol && Math.abs(b - B) <= tol;

const counts = { blue: 0, white: 0, red: 0, other: 0 };
const otherColors = new Map();
let ominX = W, ominY = H, omaxX = -1, omaxY = -1;

for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (near(r, g, b, BRAND, 24)) counts.blue++;
    else if (r > 200 && g > 200 && b > 200) counts.white++;
    else if (r > 120 && r > g + 40 && r > b + 40) counts.red++;
    else {
      counts.other++;
      if (x < ominX) ominX = x;
      if (x > omaxX) omaxX = x;
      if (y < ominY) ominY = y;
      if (y > omaxY) omaxY = y;
      const key = `${r >> 4},${g >> 4},${b >> 4}`;
      otherColors.set(key, (otherColors.get(key) ?? 0) + 1);
    }
  }
}

console.log(`${file} ${W}x${H}`, counts);
if (counts.other > 0) {
  console.log(`other bbox: x=${ominX}..${omaxX} y=${ominY}..${omaxY}`);
  const top = [...otherColors.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
  console.log("top other colors (r>>4,g>>4,b>>4):", top.map(([k, n]) => `${k}:${n}`).join("  "));
  // Row profile of "other" pixels to see the arc shape
  const rows = [];
  for (let y = 0; y < H; y += Math.max(1, Math.floor(H / 40))) {
    let c = 0;
    for (let dy = y; dy < Math.min(H, y + H / 40); dy++) {
      for (let x = 0; x < W; x++) {
        const i = (dy * W + x) * 4;
        const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
        if (!near(r, g, b, BRAND, 24) && !(r > 200 && g > 200 && b > 200) && !(r > 120 && r > g + 40 && r > b + 40)) c++;
      }
    }
    if (c > 0) rows.push(`y~${y}: ${c}`);
  }
  console.log(rows.join("\n"));
}
