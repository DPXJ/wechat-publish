#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';

const H2_SECTION = 'text-align: center; margin: 30px 0 16px 0;';
const H2_SPAN = 'background-color: #23e89a; color: #1F2329; padding: 8px 24px; border-radius: 6px; font-size: 18px; font-weight: bold; display: inline-block; line-height: 2;';
const H3_SECTION = 'border-bottom: 2px solid #02A8F9; padding-bottom: 8px; margin: 24px 0 14px 0;';
const H3_SPAN = 'color: #02A8F9; font-size: 17px; font-weight: bold;';

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile) {
  console.error('Usage: node preprocess-dark.mjs <input.md> [output.md]');
  process.exit(1);
}

let content = readFileSync(inputFile, 'utf-8');

const parts = content.split(/(```[\s\S]*?```)/g);

for (let i = 0; i < parts.length; i++) {
  if (i % 2 === 1) continue;

  parts[i] = parts[i].replace(/^## (.+)$/gm, (_, title) =>
    `<section style="${H2_SECTION}"><span style="${H2_SPAN}">${title.trim()}</span></section>`
  );

  parts[i] = parts[i].replace(/^### (.+)$/gm, (_, title) =>
    `<section style="${H3_SECTION}"><span style="${H3_SPAN}">■ ${title.trim()}</span></section>`
  );
}

content = parts.join('');

const out = outputFile || join(dirname(inputFile), `_processed_${basename(inputFile)}`);
writeFileSync(out, content, 'utf-8');
console.log(out);
