// One-off analysis of brand/logo.png: tile bounds, blue color, white-row profile.
import { readFileSync } from "node:fs";
import { PNG } from "pngjs";

const png = PNG.sync.read(readFileSync("brand/logo.png"));
const { width: W, height: H, data } = png;

const px = (x, y) => {
  const i = (y * W + x) * 4;
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
const isBlue = (r, g, b) => b > 120 && b > r + 40 && g > r - 10 && g < b;

let minX = W, minY = H, maxX = -1, maxY = -1;
const colorCount = new Map();
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const [r, g, b] = px(x, y);
    if (isBlue(r, g, b)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const key = `${r >> 3},${g >> 3},${b >> 3}`;
      colorCount.set(key, (colorCount.get(key) ?? 0) + 1);
    }
  }
}
const tw = maxX - minX + 1;
const th = maxY - minY + 1;
console.log(`tile bbox: x=${minX}..${maxX} y=${minY}..${maxY}  (${tw}x${th})`);

let best = null, bestN = -1;
for (const [key, n] of colorCount) {
  if (n > bestN) { bestN = n; best = key; }
}
const [br, bg, bb] = best.split(",").map((v) => (parseInt(v) << 3) + 4);
const hex = (v) => v.toString(16).padStart(2, "0").toUpperCase();
console.log(`brand blue ~ #${hex(br)}${hex(bg)}${hex(bb)} (rgb ${br},${bg},${bb}), ${bestN} px`);

// White-row profile inside the tile: rows with many white pixels = artwork/text bands.
const isWhite = (r, g, b) => r > 200 && g > 200 && b > 200;
const runs = [];
let runStart = -1;
for (let y = minY; y <= maxY; y++) {
  let wc = 0;
  for (let x = minX; x <= maxX; x++) {
    const [r, g, b] = px(x, y);
    if (isWhite(r, g, b)) wc++;
  }
  const dense = wc > tw * 0.03;
  if (dense && runStart < 0) runStart = y;
  if (!dense && runStart >= 0) {
    runs.push([runStart - minY, y - 1 - minY]);
    runStart = -1;
  }
}
if (runStart >= 0) runs.push([runStart - minY, maxY - minY]);
console.log("dense-white row runs (y relative to tile top):", JSON.stringify(runs));
