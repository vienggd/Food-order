// Builds docs/final-delivery/final_delivery_sec131_Est.pdf: cover + navigation + contents,
// Parts A–E, and complete living documentation & all F-01..F-12 contracts in Appendices (per Final Delivery rubric).
// Page numbers are real: every section prints on its own first to count its exact pages.
// Usage: node scripts/final-report-pdf.mjs
import { chromium } from "@playwright/test";
import { marked } from "marked";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUT_DIR = "docs/final-delivery";
const OUT_PDF = `${OUT_DIR}/final_delivery_sec131_Est.pdf`;
const REPO = "https://github.com/vienggd/Food-order";
const commit = execSync("git rev-parse --short HEAD").toString().trim();
const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

const PARTS = [
  { id: "A", title: "Product overview, setup, and live demonstrations", files: ["docs/final-delivery/part-a-product.md"], ids: "F-01..F-12 completion, setup, Cloud SQL persistence template, @2x demos + PENDING v1.0.0 items" },
  { id: "B", title: "Engineering process, PR chains, and team contributions", files: ["docs/final-delivery/part-b-process.md"], ids: "3-sprint history, F-03 (#4->#26) & F-06 (#119/#143) chains, contributions, AI-use statement" },
  { id: "C", title: "Final requirements and verification traceability", files: ["docs/final-delivery/part-c-traceability.md"], ids: "Open baseline FR/BR/NFR, F-09..F-12 AC (51 AC), NFR-01..09 template, post-S1 API access checks" },
  { id: "D", title: "Quality assurance, UAT closure, and Definition of Done", files: ["docs/final-delivery/part-d-qa-dod.md"], ids: "Final suite (PENDING v1.0.0), EN-009_P3 Lab 6 closure (9/9 PASS), Final UAT plan, debt, DoD" },
  { id: "E", title: "Final demonstration video plan and script (<= 4 min)", files: ["docs/final-delivery/part-e-video.md"], ids: "YouTube link placeholder, <= 4:00 two-presenter in-person script, pre-recording checklist" },
  { id: "App 1", title: "Living SRS, feature inventory, and System-Level SDS", files: ["docs/srs.md", "docs/features.md", "docs/system-sds.md"], ids: "FR-01..FR-18, BR-01..BR-27, NFR-01..NFR-09, DEC-01..DEC-11, F-01..F-12, SDS v3" },
  { id: "App 2", title: "Updated full traceability matrix (all requirements and 173 AC)", files: ["docs/traceability.md"], ids: "Requirements, NFRs, and 173-AC verification status table" },
  {
    id: "App 3",
    title: "Sprint 1–3 engineering contracts and Definition of Done",
    files: [
      "docs/sprint_1/sprints/sprint-1/F-01-auth.md",
      "docs/sprint_1/sprints/sprint-1/F-02-menu.md",
      "docs/sprint_1/sprints/sprint-1/F-03-orders.md",
      "docs/sprint_1/sprints/sprint-1/F-04-accept.md",
      "docs/sprint_2/sprints/F-05-menu-management.md",
      "docs/sprint_2/sprints/F-06-cancel-reject.md",
      "docs/sprint_2/sprints/F-07-fulfilment.md",
      "docs/sprint_2/sprints/F-08-payment.md",
      "docs/sprint_2/sprints/F-09-pickup-slots.md",
      "docs/sprint_2/sprints/F-10-sales-summary.md",
      "docs/sprint_2/sprints/F-11-search-filter.md",
      "docs/sprint_2/sprints/F-12-hardening.md",
      "docs/sprint_1/sprints/sprint-1/definition-of-done.md",
    ],
    ids: "Complete F-01..F-12 contracts, AC, test specifications, and shared Definition of Done",
  },
];

const CSS = `
  @page { size: A4; margin: 14mm 14mm 16mm; }
  body { font: 9.2pt/1.42 "Segoe UI", system-ui, sans-serif; color: #2b1b14; margin: 0; }
  section { break-before: page; }
  h1 { font-size: 17pt; color: #2f4a3a; margin: 0 0 6px; }
  h1.part { font-size: 19pt; border-bottom: 3px solid #e0b07a; padding-bottom: 4px; }
  h2 { font-size: 13pt; color: #2f4a3a; margin: 12px 0 5px; break-after: avoid; }
  h3 { font-size: 11pt; color: #2f4a3a; border-bottom: 1px solid #e0b07a; margin: 12px 0 5px; break-after: avoid; }
  h4, h5 { font-size: 9.8pt; margin: 9px 0 4px; break-after: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 9px; font-size: 8.1pt; }
  th, td { border: 1px solid #d9cbb8; padding: 3px 5px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  th { background: #f3ebdd; }
  tr { break-inside: avoid; }
  code { font: 7.8pt Consolas, monospace; background: #f6efe4; padding: 0 2px; border-radius: 3px; }
  pre { font: 7.6pt/1.32 Consolas, monospace; background: #f6efe4; padding: 6px; border-radius: 5px; white-space: pre-wrap; break-inside: avoid; }
  pre code { background: none; padding: 0; }
  .fig { display: inline-block; vertical-align: top; width: 31%; margin: 0 1.5% 8px 0; break-inside: avoid; }
  .fig.wide { width: 48%; }
  .fig img { width: 100%; max-height: 115mm; object-fit: contain; object-position: top; border: 1px solid #d9cbb8; border-radius: 4px; }
  .cap { display: block; font-size: 7.4pt; color: #6e5e4f; margin-top: 2px; }
  a { color: #2f4a3a; }
  .todo { background: #fde3e0; color: #7a1c12; font-weight: 600; padding: 0 3px; }
  .muted { color: #6e5e4f; }
  .toc td:last-child, .toc th:last-child, .nav td:nth-child(2), .nav th:nth-child(2) { white-space: nowrap; }
`;

let missingImgs = 0;
function renderMarkdown(file) {
  const md = readFileSync(file, "utf8").replaceAll("__COMMIT__", commit).replaceAll("__BRANCH__", branch);
  const base = posix.dirname(file);
  const renderer = new marked.Renderer();
  renderer.heading = function ({ tokens, depth }) {
    const d = Math.min(depth + 1, 6);
    return `<h${d}>${this.parser.parseInline(tokens)}</h${d}>\n`;
  };
  renderer.link = function ({ href, tokens }) {
    const text = this.parser.parseInline(tokens);
    if (/^(https?:|mailto:|#)/.test(href)) return `<a href="${href}">${text}</a>`;
    const path = posix.normalize(posix.join(base, href));
    return `<a href="${REPO}/blob/${commit}/${path}">${text}</a>`;
  };
  renderer.image = ({ href, text }) => {
    let src = href;
    if (!/^https?:/.test(href)) {
      const diskPath = resolve(dirname(file), href);
      if (!existsSync(diskPath)) {
        missingImgs++;
        console.error(`MISSING_IMAGE ${file} -> ${href}`);
      }
      src = pathToFileURL(diskPath).href;
    }
    const wide = /desktop|github/.test(href) ? " wide" : "";
    return `<span class="fig${wide}"><img src="${src}" alt="${text}"><span class="cap">${text}</span></span>`;
  };
  return marked.parse(md, { renderer, gfm: true });
}

const missing = (file) => `<p class="todo">${file} is missing in this commit.</p>`;

const sections = PARTS.flatMap((p) =>
  p.files.map((file, i) => ({
    part: p,
    file,
    html: (i === 0 ? `<h1 class="part">${p.id.startsWith("App") ? p.id : "Part " + p.id} — ${p.title}</h1>` : "") + (existsSync(file) ? renderMarkdown(file) : missing(file)),
  })),
);

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><style>${CSS}</style></head><body>${body}</body></html>`;
const tmp = resolve(OUT_DIR, ".render.html");
const browser = await chromium.launch();
const tab = await browser.newPage();

async function printPdf(html, opts = {}) {
  writeFileSync(tmp, page(html));
  await tab.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
  return tab.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true, ...opts });
}
const pageCount = (pdf) => (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

function front(startPages) {
  const sectionTitle = (s) => {
    const m = existsSync(s.file) && readFileSync(s.file, "utf8").match(/^# (.+)$/m);
    return m ? m[1] : s.file;
  };
  const range = (from, to) => (from === to ? `${from}` : `${from}–${to}`);
  const nav = PARTS.map((p) => {
    const own = sections.filter((s) => s.part === p);
    const first = startPages.get(own[0]);
    const last = startPages.get(own.at(-1)) + own.at(-1).pages - 1;
    const label = p.id.startsWith("App") ? p.id : `Part ${p.id}`;
    return `<tr><td>${label} — ${p.title}</td><td>${range(first, last)}</td><td>${p.ids}</td></tr>`;
  }).join("");
  const toc = sections.map((s) => `<tr><td>${s.part.id}</td><td>${sectionTitle(s)}</td><td>${startPages.get(s)}</td></tr>`).join("");
  return (
    renderMarkdown(`${OUT_DIR}/cover.md`).replace(/<h2>/, '<h1 style="font-size:21pt">').replace(/<\/h2>/, "</h1>") +
    `<h2>Navigation</h2><table class="nav"><tr><th>Part / Appendix</th><th>Pages</th><th>Contents &amp; IDs</th></tr>${nav}</table>` +
    `<h2>Contents</h2><table class="toc"><tr><th>Part</th><th>Section</th><th>Page</th></tr>${toc}</table>`
  );
}

for (const s of sections) s.pages = pageCount(await printPdf(`<section style="break-before:auto">${s.html}</section>`));
let frontPages = 1;
let starts;
for (let i = 0; i < 4; i++) {
  starts = new Map();
  let next = frontPages + 1;
  for (const s of sections) {
    starts.set(s, next);
    next += s.pages;
  }
  const measured = pageCount(await printPdf(front(starts)));
  if (measured === frontPages) break;
  frontPages = measured;
}

const footer = `<div style="font-size:7px;width:100%;text-align:center;color:#6e5e4f">Food-order · Final Project Delivery (Draft) · commit ${commit} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`;
const pdf = await printPdf(front(starts) + sections.map((s) => `<section>${s.html}</section>`).join(""), {
  path: OUT_PDF,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: footer,
});
await browser.close();
rmSync(tmp);

const expected = frontPages + sections.reduce((n, s) => n + s.pages, 0);
const total = pageCount(pdf);
if (missingImgs > 0) throw new Error(`Missing ${missingImgs} image(s)`);
if (total !== expected) throw new Error(`Page mismatch: total ${total} != expected ${expected}`);
console.log(`Wrote ${OUT_PDF}: ${total} pages (front ${frontPages}p, missingImgs=${missingImgs}) for commit ${commit}`);
for (const s of sections) console.log(`  p.${starts.get(s)}\t${s.pages}p\t${s.part.id}\t${s.file}`);
