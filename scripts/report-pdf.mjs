// Builds docs/deliverable-1/report.pdf: cover + navigation + contents, then Parts A–F rendered from the repo's
// Markdown (handout section 4: the complete documents must be inside the PDF).
// Page numbers are real: every section starts on a new page and is printed on its own first to count its pages.
// Usage: node scripts/report-pdf.mjs
import { chromium } from "@playwright/test";
import { marked } from "marked";
import { execSync } from "node:child_process";
import { existsSync, readFileSync, writeFileSync, rmSync } from "node:fs";
import { dirname, posix, resolve } from "node:path";
import { pathToFileURL } from "node:url";

const OUT_DIR = "docs/deliverable-1";
const REPO = "https://github.com/vienggd/Food-order";
const commit = execSync("git rev-parse --short HEAD").toString().trim();
const branch = execSync("git rev-parse --abbrev-ref HEAD").toString().trim();

// One entry per Part (handout 4.1 order). `ids` feeds the navigation table (4.3).
const PARTS = [
  { id: "A", title: "SRS and product scope", files: ["docs/srs.md"], ids: "Actors, scope, FR-01..FR-18, BR-01..BR-07, NFR-01..NFR-09, AS-01..06, DEC-01..08" },
  { id: "B", title: "Feature inventory and traceability", files: ["docs/features.md", "docs/traceability.md"], ids: "F-01..F-12; FR/BR/NFR → feature → sprint → AC → TEST → result" },
  { id: "C", title: "System-Level SDS", files: ["docs/system-sds.md"], ids: "Architecture, data model, API conventions, role matrix (5.2), sessions, configuration, GCP plan" },
  { id: "D", title: "Three-sprint plan", files: ["docs/sprints/plan.md"], ids: "Sprint goals, F-01..F-12 allocation, dependencies, Sprint 1 scope, risks" },
  {
    id: "E",
    title: "Sprint 1 engineering contracts",
    files: ["docs/sprints/sprint-1/F-01-auth.md", "docs/sprints/sprint-1/F-02-menu.md", "docs/sprints/sprint-1/F-03-orders.md", "docs/sprints/sprint-1/F-04-accept.md", "docs/sprints/sprint-1/definition-of-done.md"],
    ids: "F-01..F-04; AC-F01-01..AC-F04-13 (46 AC); TEST-F01-01..TEST-F04-13 (58 tests); Definition of Done",
  },
  { id: "F", title: "Working Sprint 1 and verification", files: ["docs/evidence/part-f.md"], ids: "Demonstrations, build/test results, AC → test results, test excerpts, TDD, Issues/PRs, board, contribution, limitations" },
];

const CSS = `
  @page { size: A4; margin: 14mm 14mm 16mm; }
  body { font: 9.5pt/1.45 "Segoe UI", system-ui, sans-serif; color: #2b1b14; margin: 0; }
  section { break-before: page; }
  h1 { font-size: 18pt; color: #2f4a3a; margin: 0 0 6px; }
  h1.part { font-size: 20pt; border-bottom: 3px solid #e0b07a; padding-bottom: 4px; }
  h2 { font-size: 14pt; color: #2f4a3a; margin: 14px 0 6px; break-after: avoid; }
  h3 { font-size: 11.5pt; color: #2f4a3a; border-bottom: 1px solid #e0b07a; margin: 14px 0 5px; break-after: avoid; }
  h4, h5 { font-size: 10pt; margin: 10px 0 4px; break-after: avoid; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 10px; font-size: 8.3pt; }
  th, td { border: 1px solid #d9cbb8; padding: 3px 5px; text-align: left; vertical-align: top; overflow-wrap: anywhere; }
  th { background: #f3ebdd; }
  tr { break-inside: avoid; }
  code { font: 8pt Consolas, monospace; background: #f6efe4; padding: 0 2px; border-radius: 3px; }
  pre { font: 7.8pt/1.35 Consolas, monospace; background: #f6efe4; padding: 7px; border-radius: 5px; white-space: pre-wrap; break-inside: avoid; }
  pre code { background: none; padding: 0; }
  .fig { display: inline-block; vertical-align: top; width: 31%; margin: 0 1.5% 8px 0; break-inside: avoid; }
  .fig.wide { width: 48%; }
  .fig img { width: 100%; max-height: 120mm; object-fit: contain; object-position: top; border: 1px solid #d9cbb8; border-radius: 4px; }
  .cap { display: block; font-size: 7.5pt; color: #6e5e4f; }
  a { color: #2f4a3a; }
  .todo { background: #fde3e0; color: #7a1c12; font-weight: 600; padding: 0 3px; }
  .muted { color: #6e5e4f; }
  .toc td:last-child, .toc th:last-child, .nav td:nth-child(2), .nav th:nth-child(2) { white-space: nowrap; }
`;

// Markdown → HTML. Headings move down one level (the Part title is h1). Relative links point to the repo
// at the submitted commit; relative images load from disk.
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
    const src = /^https?:/.test(href) ? href : pathToFileURL(resolve(dirname(file), href)).href;
    // Screenshots sit side by side with their alt text as caption; desktop/GitHub shots get half width.
    const wide = /desktop|github/.test(href) ? " wide" : "";
    return `<span class="fig${wide}"><img src="${src}" alt="${text}"><span class="cap">${text}</span></span>`;
  };
  return marked.parse(md, { renderer, gfm: true });
}

const missing = (file) =>
  `<p class="todo">${file} is not in this commit yet — this section is generated from it when it is added.</p>`;

// Sections: each document is its own section (new page). The first file of a Part carries the Part title.
const sections = PARTS.flatMap((p) =>
  p.files.map((file, i) => ({
    part: p,
    file,
    html:
      (i === 0 ? `<h1 class="part">Part ${p.id} — ${p.title}</h1>` : "") +
      (existsSync(file) ? renderMarkdown(file) : missing(file)),
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

// Front matter: cover + navigation table + contents. Its page count depends on the numbers only a little,
// so lay it out with the final numbers and re-measure until stable.
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
    return `<tr><td>Part ${p.id} — ${p.title}</td><td>${range(first, last)}</td><td>${p.ids}</td></tr>`;
  }).join("");
  const toc = sections
    .map((s) => `<tr><td>${s.part.id}</td><td>${sectionTitle(s)}</td><td>${startPages.get(s)}</td></tr>`)
    .join("");
  return (
    renderMarkdown(`${OUT_DIR}/cover.md`).replace(/<h2>/, '<h1 style="font-size:22pt">').replace(/<\/h2>/, "</h1>") +
    `<h2>Navigation</h2><table class="nav"><tr><th>Part</th><th>Pages</th><th>Relevant IDs</th></tr>${nav}</table>` +
    `<h2>Contents</h2><table class="toc"><tr><th>Part</th><th>Section</th><th>Page</th></tr>${toc}</table>`
  );
}

for (const s of sections) s.pages = pageCount(await printPdf(`<section style="break-before:auto">${s.html}</section>`));
let frontPages = 1;
let starts;
for (let i = 0; i < 3; i++) {
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

const footer = `<div style="font-size:7px;width:100%;text-align:center;color:#6e5e4f">Food-order · Deliverable 1 · commit ${commit} · page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`;
const pdf = await printPdf(front(starts) + sections.map((s) => `<section>${s.html}</section>`).join(""), {
  path: `${OUT_DIR}/report.pdf`,
  displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: footer,
});
await browser.close();
rmSync(tmp);

const expected = frontPages + sections.reduce((n, s) => n + s.pages, 0);
const total = pageCount(pdf);
console.log(`Wrote ${OUT_DIR}/report.pdf: ${total} pages for commit ${commit}` + (total === expected ? "" : ` (WARNING: expected ${expected}; page numbers may be off)`));
for (const s of sections) console.log(`  p.${starts.get(s)}\t${s.pages}p\tPart ${s.part.id}\t${s.file}`);
