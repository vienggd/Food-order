// Prints docs/deliverable-1/report.html to report.pdf with Playwright's Chromium (no extra dependency).
// Usage: node scripts/report-pdf.mjs   (fills __COMMIT__ with the current commit)
import { chromium } from "@playwright/test";
import { execSync } from "node:child_process";
import { readFileSync, writeFileSync, rmSync } from "node:fs";
import { pathToFileURL } from "node:url";

const dir = "docs/deliverable-1";
const commit = execSync("git rev-parse --short HEAD").toString().trim();
const tmp = `${dir}/.report-render.html`; // same folder so relative image paths work
writeFileSync(tmp, readFileSync(`${dir}/report.html`, "utf8").replaceAll("__COMMIT__", commit));
const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto(pathToFileURL(tmp).href, { waitUntil: "load" });
await page.pdf({ path: `${dir}/report.pdf`, format: "A4", printBackground: true, displayHeaderFooter: true,
  headerTemplate: "<span></span>",
  footerTemplate: `<div style="font-size:8px;width:100%;text-align:center;color:#6e5e4f">Food-order Deliverable 1 · ${commit} · page <span class="pageNumber"></span>/<span class="totalPages"></span></div>`,
  margin: { top: "14mm", bottom: "16mm", left: "14mm", right: "14mm" } });
await browser.close();
rmSync(tmp);
console.log(`Wrote ${dir}/report.pdf for commit ${commit}`);
