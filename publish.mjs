#!/usr/bin/env node
/**
 * 发布入口：当 config 中 theme 为 dark 时，先对 md 做预处理再调用 index.js 发布。
 * 用法与 index.js 一致：node publish.mjs --config ./config.json
 */
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const configIdx = args.indexOf('--config');
const configPath = configIdx >= 0 && args[configIdx + 1] ? args[configIdx + 1] : join(__dirname, 'config.json');
const configAbs = join(process.cwd(), configPath.replace(/^\.\//, ''));

if (!existsSync(configAbs)) {
  console.error('Config file not found:', configAbs);
  process.exit(1);
}

let cfg = JSON.parse(readFileSync(configAbs, 'utf-8'));
let finalConfigPath = configAbs;

if (cfg.theme === 'dark' && cfg.markdownFilePath) {
  const preprocessScript = join(__dirname, 'preprocess-dark.mjs');
  const out = execSync(`node "${preprocessScript}" "${cfg.markdownFilePath}"`, { encoding: 'utf-8' }).trim();
  cfg = { ...cfg, markdownFilePath: out };
  const tempConfig = join(__dirname, '.config-dark-publish.json');
  writeFileSync(tempConfig, JSON.stringify(cfg, null, 2), 'utf-8');
  finalConfigPath = tempConfig;
  const newArgs = [...args];
  if (configIdx >= 0 && newArgs[configIdx + 1]) newArgs[configIdx + 1] = finalConfigPath;
  args.length = 0;
  args.push(...newArgs);
}

const indexPath = join(__dirname, 'index.js');
const runArgs = [...args];
if (configIdx >= 0 && runArgs[configIdx + 1] !== undefined) runArgs[configIdx + 1] = finalConfigPath;
const cmd = ['node', `"${indexPath}"`, ...runArgs.map(a => a.includes(' ') ? `"${a}"` : a)].join(' ');
try {
  execSync(cmd, { stdio: 'inherit', cwd: __dirname, shell: true });
} finally {
  if (finalConfigPath !== configAbs && existsSync(finalConfigPath)) {
    try { unlinkSync(finalConfigPath); } catch (_) {}
  }
}
