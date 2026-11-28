// Builds docs/sprint_2/deliverable-2/deliverable2_sec131_Est.pdf: cover + navigation + contents,
// Parts A–E, and complete living documentation & contracts in Appendices (per deliverable 2 rubric).
// Page numbers are real: each section prints on its own first to count its exact pages.
// Usage: node scripts/sprint2-report-pdf.mjs
import { chromium } from "@playwright/test";
import { marked } from "marked";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUT_DIR = "docs/sprint_2/deliverable-2";
const OUT_PDF = `${OUT_DIR}/deliverable2_sec131_Est.pdf`;
const REPO = "https://github.com/vienggd/Food-order";
const commit = execSync("git rev-parse --short HEAD").toString().trim();
const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

const PARTS = [
  { id: "A", title: "Summary and release status", files: ["docs/sprint_2/deliverable-2/part-a.md"], ids: "Executive summary, v0.1.0-sprint1 / 39bda5e / v0.2.0-sprint2 / df6db99 / food-order-00010-7vp, scope & risks" },
  { id: "B", title: "Working Sprint 2 prototype and demonstration", files: ["docs/sprint_2/deliverable-2/part-b.md"], ids: "Setup, Sprint 1 continuity, F-05..F-08 + F-09/F-11 @2x screenshots, API 401/403/404/400/409, test counts" },
  { id: "C", title: "Sprint 3 contracts, working progress, and plan to 13 Dec", files: ["docs/sprint_2/deliverable-2/part-c.md"], ids: "F-09..F-12 contracts, implemented F-09/F-11 progress, 13 Dec schedule (exam protection)" },
  { id: "D", title: "Updated requirements and test traceability", files: ["docs/sprint_2/deliverable-2/part-d.md"], ids: "Living docs v3 audit (153/173 AC), TEST-F09-02/03 & TEST-F11-15 excerpts, 2 Issue/PR chains" },
  { id: "E", title: "Integrated release candidate, readiness, process and reflection", files: ["docs/sprint_2/deliverable-2/part-e.md"], ids: "Contract-before-code, TDD red->green table, PR/Board 4 flow, contributions, AI use, limitations" },
  { id: "App 1", title: "Living SRS, feature inventory, and System-Level SDS", files: ["docs/srs.md", "docs/features.md", "docs/system-sds.md"], ids: "FR-01..FR-18, BR-01..BR-27, NFR-01..NFR-09, DEC-01..DEC-11, F-01..F-12, SDS v3" },
  { id: "App 2", title: "Updated traceability matrix (all requirements and 173 AC)", files: ["docs/traceability.md"], ids: "Requirements & per-AC matrix verified on sprint2 (153/173 Pass, 20 planned)" },
  {
    id: "App 3",
    title: "Sprint 2 and Sprint 3 feature contracts and Definition of Done",
    files: [
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
    ids: "F-05..F-12 engineering contracts, AC, test specs, and shared Definition of Done",
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

const footer = `<div style="font-size:7px;width:100%;text-align:center;color:#6e5e4f">Food-order · Deliverable 2 · commit ${commit} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`;
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
