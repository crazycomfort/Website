#!/usr/bin/env node
/**
 * Flags hero button pairs whose heights differ, and star glyphs that are not #FFB800.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const puppeteer = require("puppeteer-core");

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), "..");
const base = process.env.SITE_BASE || "http://127.0.0.1:8765";
const sitemap = fs.readFileSync(path.join(root, "sitemap.xml"), "utf8");
const urls = [...sitemap.matchAll(/<loc>https:\/\/crazycomfort.com([^<]*)<\/loc>/g)].map((m) => m[1] || "/");

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

const failures = [];
for (const width of [1280, 390]) {
  await page.setViewport({ width, height: 900, deviceScaleFactor: 1 });
  for (const url of urls) {
    try {
      await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 20000 });
    } catch (err) {
      failures.push(`${width} ${url} LOAD ${err.message}`);
      continue;
    }
    const found = await page.evaluate(() => {
      const out = [];
      const gold = "rgb(255, 184, 0)";
      const hero = document.querySelector(".lp-hero, .hero-new, .hc-hero") || document.querySelector("main .homepage-section, main > section");
      if (hero) {
        hero.querySelectorAll(".page-contact, .cta-buttons, .hc-actions, .lp-actions").forEach((group) => {
          const links = [...group.querySelectorAll(":scope > a")].filter((el) => {
            const r = el.getBoundingClientRect();
            const s = getComputedStyle(el);
            return r.height > 8 && s.display !== "none" && s.visibility !== "hidden";
          });
          if (links.length < 2) return;
          const heights = links.map((el) => Math.round(el.getBoundingClientRect().height));
          const min = Math.min(...heights);
          const max = Math.max(...heights);
          if (max - min > 1) {
            out.push(`buttons ${heights.join("/")} "${links.map((el) => el.textContent.replace(/\s+/g, " ").trim()).join(" | ")}"`);
          }
        });
      }
      const stars = [];
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
      let node;
      while ((node = walker.nextNode())) {
        if (!node.textContent.includes("★")) continue;
        const el = node.parentElement;
        if (!el || stars.includes(el)) continue;
        stars.push(el);
      }
      document.querySelectorAll(".cc-stars").forEach((el) => {
        if (!stars.includes(el)) stars.push(el);
      });
      stars.forEach((el) => {
        const s = getComputedStyle(el);
        if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return;
        const r = el.getBoundingClientRect();
        if (r.width < 2 || r.height < 2 || r.bottom < 0 || r.top > innerHeight) return;
        const fill = s.webkitTextFillColor && s.webkitTextFillColor !== "rgba(0, 0, 0, 0)" ? s.webkitTextFillColor : s.color;
        if (fill !== gold) {
          out.push(`star ${fill} "${el.textContent.replace(/\s+/g, " ").trim().slice(0, 40)}"`);
        }
      });
      return out;
    });
    found.forEach((row) => failures.push(`${width} ${url} ${row}`));
  }
}
await browser.close();
console.log(`hero-consistency failures ${failures.length} across ${urls.length} urls x 2 widths`);
failures.slice(0, 40).forEach((row) => console.log(row));
process.exit(failures.length ? 1 : 0);
