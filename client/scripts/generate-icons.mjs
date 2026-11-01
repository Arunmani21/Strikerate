// Brand asset pipeline — source of truth: brand/logo.png (user's SR logo).
// Derives: PWA icons, favicon, Capacitor Android icon/splash sources,
// and public/brand/mark.png for the in-app wordmark.
// Run: node scripts/generate-icons.mjs && cap sync android
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { PNG } from "pngjs";

const root = join(dirname(), "..");
function dirname() {
  return new URL(".", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
}

const src = PNG.sync.read(readFileSync(join(root, "brand", "logo.png")));
const { width: W, height: H, data } = src;

const at = (x, y) => (y * W + x) * 4;
const px = (x, y) => {
  const i = at(x, y);
  return [data[i], data[i + 1], data[i + 2], data[i + 3]];
};
const isBlue = (r, g, b) => b > 120 && b > r + 40 && g > r - 10 && g < b;
// Dark ink: remnants of the tile's outline stroke and the source's subtle
// drop shadow. White->blue AA blends only brighten (b >= 164), so this can
// only match foreign strokes; red ball pixels are excluded via r > g + 30.
const isDark = (r, g, b) => b < 150 && g < 130 && !(r > g + 30);

// --- 1. Tile bounds + exact brand blue ---------------------------------
let minX = W, minY = H, maxX = -1, maxY = -1;
const mode = new Map();
for (let y = 0; y < H; y++) {
  for (let x = 0; x < W; x++) {
    const [r, g, b] = px(x, y);
    if (isBlue(r, g, b)) {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
      const key = `${r},${g},${b}`;
      mode.set(key, (mode.get(key) ?? 0) + 1);
    }
  }
}
let bestKey = "", bestN = -1;
for (const [k, n] of mode) if (n > bestN) { bestN = n; bestKey = k; }
const [BR, BG, BB] = bestKey.split(",").map(Number);
const hex = (v) => v.toString(16).padStart(2, "0").toUpperCase();
const BRAND_BLUE = `#${hex(BR)}${hex(BG)}${hex(BB)}`;
console.log("brand blue:", BRAND_BLUE);

const tw = maxX - minX + 1;
// Content bands measured by scripts/analyze-logo.mjs (y relative to tile top):
// ball+bails+SR mark ~85..480, "STRIKE RATE" text 531..590, subtitle 619..644.
const MARK_TOP = 60;
const MARK_BOTTOM = 510;

// --- 2. Helpers ---------------------------------------------------------
function canvas(w, h, [r, g, b, a] = [BR, BG, BB, 255]) {
  const out = new PNG({ width: w, height: h });
  for (let i = 0; i < out.data.length; i += 4) {
    out.data[i] = r;
    out.data[i + 1] = g;
    out.data[i + 2] = b;
    out.data[i + 3] = a;
  }
  return out;
}

function bilinear(img, dw, dh) {
  const out = new PNG({ width: dw, height: dh });
  const sx = img.width / dw, sy = img.height / dh;
  for (let y = 0; y < dh; y++) {
    const fy = Math.min(img.height - 1.001, (y + 0.5) * sy - 0.5);
    const y0 = Math.max(0, Math.floor(fy));
    const ty = fy - y0;
    for (let x = 0; x < dw; x++) {
      const fx = Math.min(img.width - 1.001, (x + 0.5) * sx - 0.5);
      const x0 = Math.max(0, Math.floor(fx));
      const tx = fx - x0;
      for (let c = 0; c < 4; c++) {
        const i00 = ((y0 * img.width) + x0) * 4 + c;
        const i10 = i00 + 4;
        const i01 = i00 + img.width * 4;
        const i11 = i01 + 4;
        const top = img.data[i00] * (1 - tx) + img.data[i10] * tx;
        const bot = img.data[i01] * (1 - tx) + img.data[i11] * tx;
        out.data[(y * dw + x) * 4 + c] = Math.round(top * (1 - ty) + bot * ty);
      }
    }
  }
  return out;
}

function paste(dst, srcImg, ox, oy) {
  for (let y = 0; y < srcImg.height; y++) {
    for (let x = 0; x < srcImg.width; x++) {
      const si = (y * srcImg.width + x) * 4;
      if (srcImg.data[si + 3] === 0) continue;
      const di = ((oy + y) * dst.width + (ox + x)) * 4;
      for (let c = 0; c < 4; c++) dst.data[di + c] = srcImg.data[si + c];
    }
  }
}

// The mark strip: full tile width, from above the ball to below the SR.
// Non-blue pixels near the strip's edges are repainted brand blue: the
// sides/shadow remnants of the tile's rounded outline. The top cleanup is
// corner-only because the red ball sits close to the top edge in the middle.
// All blue-ish pixels are flattened to the exact brand blue so source
// mottling can't show against the flat backgrounds these feed.
function extractMark() {
  const h = MARK_BOTTOM - MARK_TOP;
  const strip = new PNG({ width: tw, height: h });
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < tw; x++) {
      let [r, g, b, a] = px(minX + x, minY + MARK_TOP + y);
      const corner = (x < 170 || x > tw - 170) && y < 150;
      if (x < 64 || x > tw - 64 || corner || y > h - 24) {
        // Edge zones hold no artwork — wipe unconditionally. The outline
        // stroke's darker blues pass isBlue, so a !isBlue test would spare it.
        r = BR; g = BG; b = BB;
      } else if (isBlue(r, g, b) || isDark(r, g, b)) {
        r = BR; g = BG; b = BB;
      }
      const i = (y * tw + x) * 4;
      strip.data[i] = r; strip.data[i + 1] = g; strip.data[i + 2] = b; strip.data[i + 3] = a;
    }
  }
  return strip;
}

// Full lockup: the whole tile with the white corner rounds and edge
// anti-aliasing ring made transparent, and blues flattened to brand blue.
function extractLockup() {
  const th = maxY - minY + 1;
  const lock = new PNG({ width: tw, height: th });
  const R = 110; // tile corner radius (approx)
  const corners = [
    [R, R], [tw - 1 - R, R], [R, th - 1 - R], [tw - 1 - R, th - 1 - R],
  ];
  for (let y = 0; y < th; y++) {
    for (let x = 0; x < tw; x++) {
      let [r, g, b, a] = px(minX + x, minY + y);
      const straightEdge = x < 26 || x > tw - 26 || y < 26 || y > th - 26;
      let inCorner = false;
      if (!straightEdge) {
        for (const [cx, cy] of corners) {
          const qx = x < tw / 2 ? x < R : x > tw - 1 - R;
          const qy = y < th / 2 ? y < R : y > th - 1 - R;
          if (qx && qy) {
            inCorner = Math.hypot(x - cx, y - cy) > R - 18;
            break;
          }
        }
      }
      if (isBlue(r, g, b) || isDark(r, g, b)) {
        r = BR; g = BG; b = BB;
      } else if (straightEdge || inCorner) {
        // Transparent, but store brand blue as the RGB: bilinear scaling
        // blends neighbors' RGB, and a stored white/stroke color would bleed
        // back in as ghost arcs along the rounded corners.
        r = BR; g = BG; b = BB; a = 0;
      }
      const i = (y * tw + x) * 4;
      lock.data[i] = r; lock.data[i + 1] = g; lock.data[i + 2] = b; lock.data[i + 3] = a;
    }
  }
  return lock;
}

function markOnBlue(side, markWidth) {
  const strip = extractMark();
  const scaled = bilinear(strip, markWidth, Math.round((markWidth * strip.height) / strip.width));
  const out = canvas(side, side);
  paste(out, scaled, Math.round((side - markWidth) / 2), Math.round((side - scaled.height) / 2));
  return out;
}

// --- 3. Outputs ----------------------------------------------------------
const publicDir = join(root, "public");
const brandDir = join(publicDir, "brand");
const assetsDir = join(root, "assets");
mkdirSync(brandDir, { recursive: true });
mkdirSync(assetsDir, { recursive: true });

const icon1024 = markOnBlue(1024, 900);          // launcher: mark big on blue
const fg1024 = markOnBlue(1024, 640);            // adaptive foreground: safe zone
const bg1024 = canvas(1024, 1024);
const maskable512 = markOnBlue(512, 330);        // PWA maskable safe zone

writeFileSync(join(assetsDir, "icon-only.png"), PNG.sync.write(icon1024));
writeFileSync(join(assetsDir, "icon-foreground.png"), PNG.sync.write(fg1024));
writeFileSync(join(assetsDir, "icon-background.png"), PNG.sync.write(bg1024));
writeFileSync(join(publicDir, "pwa-192.png"), PNG.sync.write(bilinear(icon1024, 192, 192)));
writeFileSync(join(publicDir, "pwa-512.png"), PNG.sync.write(bilinear(icon1024, 512, 512)));
writeFileSync(join(publicDir, "pwa-maskable-512.png"), PNG.sync.write(maskable512));
writeFileSync(join(publicDir, "favicon-32.png"), PNG.sync.write(bilinear(icon1024, 32, 32)));
writeFileSync(join(brandDir, "mark.png"), PNG.sync.write(bilinear(icon1024, 512, 512)));

// Splash: full lockup centered on brand blue (2732 = @capacitor/assets spec).
const splash = canvas(2732, 2732);
const lockup = bilinear(extractLockup(), 1500, Math.round((1500 * (maxY - minY + 1)) / tw));
paste(splash, lockup, Math.round((2732 - lockup.width) / 2), Math.round((2732 - lockup.height) / 2));
writeFileSync(join(assetsDir, "splash.png"), PNG.sync.write(splash));

console.log("brand assets written: public/pwa-*.png, public/favicon-32.png,");
console.log("public/brand/mark.png, assets/{icon-only,icon-foreground,icon-background,splash}.png");
