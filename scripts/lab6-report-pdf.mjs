// Builds the Lab 6 PDF from docs/labs/lab-06/report.md (handout section 12: evidence index,
// Answer Part A..D, <!-- INCLUDE: ... --> expansion, cropped screenshots with numbered captions).
// Placeholders matching __NAME__ are rendered as red PENDING boxes so a draft never passes as final.
// Usage: node scripts/lab6-report-pdf.mjs [output.pdf]
import { chromium } from "@playwright/test";
import { marked } from "marked";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const SRC = "docs/labs/lab-06/report.md";
const OUT = process.argv[2] ?? "docs/labs/lab-06/lab6_sec131_Est.pdf";
const commit = execSync("git rev-parse --short HEAD").toString().trim();

let md = readFileSync(SRC, "utf8");

// Expand sibling markdown includes (e.g., <!-- INCLUDE: part-b-uat-team.md -->), dropping top H1 and demoting headings by one level.
md = md.replace(/<!--\s*INCLUDE:\s*([^\s>]+)\s*-->/g, (_m, rel) => {
  const incPath = resolve(dirname(SRC), rel);
  let inc = readFileSync(incPath, "utf8").replace(/\r\n/g, "\n");
  inc = inc.replace(/^# [^\n]*\n+/, "");
  inc = inc.replace(/^(#{1,5}) /gm, (_hm, hashes) => `${hashes}# `);
  return inc.trim();
});

const keys = [...md.matchAll(/!\[Figure @([\w-]+)\./g)].map((m) => m[1]);
const numbers = new Map([...new Set(keys)].map((k, i) => [k, i + 1]));
const unknown = [];
md = md.replace(/Figures? @([\w-]+)(?:–@([\w-]+))?/g, (_all, a, b) => {
  const n = (k) => numbers.get(k) ?? (unknown.push(k), `?${k}`);
  return b ? `Figures ${n(a)}–${n(b)}` : `Figure ${n(a)}`;
});

const PENDING = {
  __CORRECTED_MAIN_COMMIT__: "corrected main commit (Saturday deploy)",
  __DEPLOYED_REVISION__: "deployed Cloud Run revision (Saturday deploy)",
  __PARTNER_ACCEPTANCE__: "partner Sprint 1 acceptance decision (after re-test)",
  __PARTNER_FIXED_REVISION__: "partner fixed release (planned v0.1.3-lab6)",
  __PRECHECK_SUMMARY_PLACEHOLDER__: "live AI pre-check results pending completion",
  __PARTNER_A_ROWS__: "Partner A (Kirakit) initial UAT-01/03/05 rows awaited",
  __PARTNER_RETEST_EVIDENCE__: "partner re-test evidence pending deploy",
  __PARTNER_RETEST_RESULTS__: "partner re-test of #123, other 8 fixes, and UAT-01/03/04/05 pending",
};
if (/__[A-Z0-9_]+__/.test(md)) console.warn("WARNING: placeholders left:", md.match(/__[A-Z0-9_]+__/g));
md = md.replace(/__[A-Z0-9_]+__/g, (k) => `<span class="todo">PENDING: ${PENDING[k] ?? k}</span>`);

const renderer = new marked.Renderer();
const pngWidth = (file) => readFileSync(file).readUInt32BE(16);
renderer.image = ({ href, text }) => {
  const file = resolve(dirname(SRC), href);
  const src = pathToFileURL(file).href;
  return `<figure><img src="${src}" alt="" style="width:${Math.round(pngWidth(file) / 2)}px"><figcaption>${marked.parseInline(text)}</figcaption></figure>`;
};
let body = marked.parse(md, { renderer, gfm: true }).replace(/<p>(<figure>[\s\S]*?<\/figure>)<\/p>/g, "$1");
body = body.replace(/<td>PENDING([^<]*)<\/td>/g, '<td><span class="todo">PENDING$1</span></td>');

const CSS = `
  @page { size: A4; margin: 12mm 12mm 14mm; }
  body { font: 9.2pt/1.42 "Segoe UI", system-ui, sans-serif; color: #1f2328; margin: 0; }
  h1 { font-size: 17pt; color: #2f4a3a; margin: 0 0 4px; }
  h2 { font-size: 13pt; color: #2f4a3a; border-bottom: 2px solid #e0b07a; padding-bottom: 2px; margin: 14px 0 6px; break-after: avoid; }
  h2:not(:first-of-type) { break-before: page; }
  h3 { font-size: 10.5pt; color: #2f4a3a; margin: 10px 0 4px; break-after: avoid; }
  p, li { margin: 4px 0; }
  table { width: 100%; border-collapse: collapse; margin: 5px 0 8px; font-size: 7.9pt; }
  th, td { border: 1px solid #d0c4b4; padding: 3px 5px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  th { background: #f3ebdd; }
  tr { break-inside: avoid; }
  code { font: 7.7pt Consolas, monospace; background: #f4f1ec; padding: 0 2px; border-radius: 3px; }
  pre { font: 7.5pt/1.35 Consolas, monospace; background: #f4f1ec; padding: 6px 8px; border-radius: 4px; white-space: pre-wrap; break-inside: avoid; margin: 5px 0 8px; }
  pre code { background: none; padding: 0; }
  figure { margin: 6px 0 10px; break-inside: avoid; }
  figure img { display: block; max-width: 100%; max-height: 215mm; border: 1px solid #c9c0b4; }
  figcaption { font-size: 7.8pt; color: #4d4438; margin-top: 2px; }
  a { color: #1f5f3f; }
  .todo { display: inline-block; background: #fde3e0; color: #7a1c12; border: 1px solid #e2a59d; font-weight: 600; padding: 1px 5px; border-radius: 3px; }
`;
const footer = `<div style="font-size:7px;width:100%;text-align:center;color:#6e5e4f">Food-order · Lab 6 · team Est · report commit ${commit} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`;

const tmp = resolve(dirname(SRC), ".render-lab6.html");
writeFileSync(tmp, `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`);
const browser = await chromium.launch();
const tab = await browser.newPage();
await tab.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await tab.pdf({ path: OUT, format: "A4", printBackground: true, preferCSSPageSize: true, displayHeaderFooter: true, headerTemplate: "<span></span>", footerTemplate: footer });
await browser.close();
rmSync(tmp);
console.log(`Wrote ${OUT} (${numbers.size} figures) for commit ${commit}`);
if (unknown.length) console.warn("WARNING: unknown figure keys:", unknown);
