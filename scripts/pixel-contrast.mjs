#!/usr/bin/env node
/**
 * Contrast check that samples rendered pixels when a background is a gradient.
 * Solid backgrounds use the computed color. Target: 0 failures.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");
const { PNG } = require("pngjs");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const base = process.env.SITE_BASE || "http://127.0.0.1:8765";
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>https:\/\/crazycomfort.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");

function relLum(r, g, b) {
  const f = (v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}
function ratio(a, b) {
  const l1 = relLum(...a);
  const l2 = relLum(...b);
  const hi = Math.max(l1, l2);
  const lo = Math.min(l1, l2);
  return (hi + 0.05) / (lo + 0.05);
}
function parseColor(c) {
  const m = String(c).match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  const alpha = m[4] === undefined ? 1 : Number(m[4]);
  if (alpha < 0.2) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}

const browser = await puppeteer.launch({
  executablePath: process.env.CHROME || "/usr/bin/google-chrome",
  headless: "new",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.evaluateOnNewDocument(() => {
  localStorage.setItem("exitPopupDismissed", "1");
  sessionStorage.setItem("exitPopupShown", "1");
});

let failures = 0;
const samples = [];

for (const width of [390, 1280]) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const url of urls) {
    try {
      await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (err) {
      failures += 1;
      samples.push(`${width} ${url} LOAD ${err.message}`);
      continue;
    }
    const nodes = await page.evaluate(() => {
      const out = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT);
      let el;
      while ((el = walker.nextNode())) {
        const text = (el.childNodes.length && [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()))
          ? el.textContent.replace(/\s+/g, " ").trim()
          : "";
        if (!text) continue;
        if (el.closest("[aria-hidden='true']") || el.classList.contains("cc-stars")) continue;
        const cs = getComputedStyle(el);
        if (cs.visibility === "hidden" || cs.display === "none" || Number(cs.opacity) === 0) continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 4 || rect.height < 4 || rect.bottom < 0 || rect.top > innerHeight) continue;
        let bg = null;
        let gradient = false;
        let node = el;
        while (node && node !== document.documentElement) {
          const s = getComputedStyle(node);
          if (s.backgroundImage && s.backgroundImage !== "none") gradient = true;
          const c = s.backgroundColor;
          const m = c && c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (m && (m[4] === undefined || Number(m[4]) > 0.9)) {
            bg = c;
            break;
          }
          node = node.parentElement;
        }
        const size = parseFloat(cs.fontSize);
        const weight = parseInt(cs.fontWeight, 10) || 400;
        const sampleX = Math.max(0, Math.min(window.innerWidth - 1, rect.left + Math.min(12, rect.width / 2)));
        const sampleY = Math.max(0, Math.min(window.innerHeight - 1, rect.top + rect.height / 2));
        const hit = document.elementFromPoint(sampleX, sampleY);
        if (!hit || !(el.contains(hit) || hit.contains(el) || el.parentElement?.contains(hit))) continue;
        out.push({
          text: text.slice(0, 70),
          color: cs.color,
          bg,
          gradient,
          large: size >= 24 || (size >= 18.66 && weight >= 700),
          x: rect.left + Math.min(8, rect.width / 2),
          y: rect.top + rect.height / 2,
        });
      }
      return out;
    });
    await page.addStyleTag({ content: "body * { color: transparent !important; -webkit-text-fill-color: transparent !important; text-shadow: none !important; }" });
    const png = PNG.sync.read(await page.screenshot({ type: "png" }));
    await page.evaluate(() => {
      document.querySelectorAll("style").forEach((el) => {
        if ((el.textContent || "").includes("color: transparent !important")) el.remove();
      });
    });
    for (const node of nodes) {
      const fg = parseColor(node.color);
      if (!fg) continue;
      let bg = !node.gradient ? parseColor(node.bg || "") : null;
      if (!bg) {
        const x = Math.min(png.width - 1, Math.max(0, Math.round(node.x)));
        const y = Math.min(png.height - 1, Math.max(0, Math.round(node.y)));
        const i = (png.width * y + x) << 2;
        bg = [png.data[i], png.data[i + 1], png.data[i + 2]];
      }
      const score = ratio(fg, bg);
      const need = node.large ? 3 : 4.5;
      if (score + 0.05 < need) {
        failures += 1;
        if (samples.length < 30) samples.push(`${width} ${url} ${score.toFixed(2)} "${node.text}"`);
      }
    }
  }
}
await browser.close();
console.log(`pixel-contrast failures ${failures} across ${urls.length} urls x 2 widths`);
samples.forEach((row) => console.log(row));
process.exit(failures ? 1 : 0);
