// One-off: dump coordinates of DARK artifact pixels (not white-AA, not red,
// not near brand blue) to see exactly what and where they are.
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const root = join(new URL("..", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1"));
const file = process.argv[2] ?? "assets/icon-only.png";
const png = PNG.sync.read(readFileSync(join(root, file)));
const { width: W, height: H, data } = png;

const BRAND = [1, 72, 164];
const nearBrand = (r, g, b) =>
  Math.abs(r - 1) <= 24 && Math.abs(g - 72) <= 24 && Math.abs(b - 164) <= 24;
// Dark ink: can't be white->blue AA (blends only brighten), can't be red ball.
const isDark = (r, g, b) => b < 150 && r < 120 && g < 130;

// Cluster dark pixels into a coarse grid (32px cells) and report occupied cells.
const cells = new Map();
let total = 0;
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
    if (isDark(r, g, b)) {
      total++;
      const key = `${Math.floor(x / 32)},${Math.floor(y / 32)}`;
      cells.set(key, (cells.get(key) ?? 0) + 1);
    }
  }
}
console.log(`${file}: ${total} dark px in ${cells.size} cells`);
const sorted = [...cells.entries()].sort((a, b) => b[1] - a[1]);
for (const [cell, n] of sorted.slice(0, 40)) console.log(`  cell(${cell}) x${cell.split(",")[0] * 32}-${+cell.split(",")[0] * 32 + 31} y${cell.split(",")[1] * 32}-${+cell.split(",")[1] * 32 + 31}: ${n}`);
