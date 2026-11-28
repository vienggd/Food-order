// Builds the Lab 7 PDF from docs/labs/lab-07/report.md (handout section 12: evidence index, headings
// "Answer Part 0".."Answer Part 4", links first, cropped screenshots with numbered captions).
// Figures: write "![Figure @key. caption](path)" and refer to it as "Figure @key"; numbers are given in
// order of appearance. Usage: node scripts/lab7-report-pdf.mjs [output.pdf]
import { chromium } from "@playwright/test";
import { marked } from "marked";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SRC = "docs/labs/lab-07/report.md";
const OUT = process.argv[2] ?? "docs/labs/lab-07/lab7_sec131_Est.pdf";
const commit = execSync("git rev-parse --short HEAD").toString().trim();

let md = readFileSync(SRC, "utf8");
// Expand sibling markdown includes (<!-- INCLUDE: file.md -->): drop the top H1 and demote headings one level.
md = md.replace(/<!--\s*INCLUDE:\s*([^\s>]+)\s*-->/g, (_m, rel) => {
  let inc = readFileSync(resolve(dirname(SRC), rel), "utf8").replace(/\r\n/g, "\n");
  inc = inc.replace(/^# [^\n]*\n+/, "").replace(/^(#{1,5}) /gm, (_h, hs) => hs + "# ");
  return inc.trim();
});
const keys = [...md.matchAll(/!\[Figure @([\w-]+)\./g)].map((m) => m[1]);
const numbers = new Map([...new Set(keys)].map((k, i) => [k, i + 1]));
const unknown = [];
md = md.replace(/Figures? @([\w-]+)(?:–@([\w-]+))?/g, (all, a, b) => {
  const n = (k) => numbers.get(k) ?? (unknown.push(k), `?${k}`);
  return b ? `Figures ${n(a)}–${n(b)}` : `Figure ${n(a)}`;
});
// Anything not filled in yet is printed as a red PENDING box, so a draft can never pass for the final PDF.
const PENDING = {
  __NONE__: "",
};
if (/__[A-Z0-9_]+__/.test(md)) console.warn("WARNING: placeholders left:", md.match(/__[A-Z0-9_]+__/g));
md = md.replace(/__[A-Z0-9_]+__/g, (k) => `<span class="todo">PENDING: ${PENDING[k] ?? k}</span>`);

const renderer = new marked.Renderer();
// Every screenshot is shown at the same scale (half its pixel width, capped at the page width), so text in a
// narrow crop is not blown up and all figures read alike.
const pngWidth = (file) => readFileSync(file).readUInt32BE(16);
renderer.image = ({ href, text }) => {
  const file = resolve(dirname(SRC), href);
  const src = pathToFileURL(file).href;
  return `<figure><img src="${src}" alt="" style="width:${Math.round(pngWidth(file) / 2)}px"><figcaption>${marked.parseInline(text)}</figcaption></figure>`;
};
const body = marked.parse(md, { renderer, gfm: true }).replace(/<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g, "$1");

const CSS = `
  @page { size: A4; margin: 12mm 12mm 14mm; }
  body { font: 9.3pt/1.42 "Segoe UI", system-ui, sans-serif; color: #1f2328; margin: 0; }
  h1 { font-size: 17pt; color: #2f4a3a; margin: 0 0 4px; }
  h2 { font-size: 13.5pt; color: #2f4a3a; border-bottom: 2px solid #e0b07a; padding-bottom: 2px; margin: 16px 0 6px; break-after: avoid; }
  h2:not(:first-of-type) { break-before: page; }
  h3 { font-size: 10.5pt; color: #2f4a3a; margin: 10px 0 4px; break-after: avoid; }
  p, li { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 5px 0 8px; font-size: 8pt; }
  th, td { border: 1px solid #d0c4b4; padding: 2px 4px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  th { background: #f3ebdd; }
  tr { break-inside: avoid; }
  code { font: 7.8pt Consolas, monospace; background: #f4f1ec; padding: 0 2px; border-radius: 3px; }
  pre { font: 7.6pt/1.35 Consolas, monospace; background: #f4f1ec; padding: 6px 8px; border-radius: 4px; white-space: pre-wrap; break-inside: avoid; margin: 5px 0 8px; }
  pre code { background: none; padding: 0; }
  figure { margin: 6px 0 10px; break-inside: avoid; }
  figure img { display: block; max-width: 100%; max-height: 215mm; object-fit: contain; object-position: left top; border: 1px solid #c9c0b4; }
  figcaption { font-size: 7.8pt; color: #4d4438; margin-top: 2px; }
  a { color: #1f5f3f; }
  .todo { display: inline-block; background: #fde3e0; color: #7a1c12; border: 1px solid #e2a59d; font-weight: 600; padding: 2px 5px; border-radius: 3px; }
`;
const footer = `<div style="font-size:7px;width:100%;text-align:center;color:#6e5e4f">Food-order · Lab 7 · team Est · report commit ${commit} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`;

const tmp = resolve(dirname(SRC), ".render.html");
writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`);
const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: footer });
await browser.close();
rmSync(tmp);
console.log(`Wrote ${OUT} (${numbers.size} figures) for commit ${commit}`);
if (unknown.length) console.warn("WARNING: unknown figure keys:", unknown);
