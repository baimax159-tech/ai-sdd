#!/usr/bin/env node
'use strict';
// 验证插件配置合法性
// 用法：node scripts/validate.js
// 依赖：Claude Code CLI（claude 命令可用）

const { spawnSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
let pass = 0, fail = 0;

const ok  = (msg) => { console.log(`  ✅ ${msg}`); pass++; };
const bad = (msg) => { console.log(`  ❌ ${msg}`); fail++; };

function claudeValidate(target) {
  const r = spawnSync('claude', ['plugin', 'validate', target], { stdio: 'inherit', shell: true });
  return r.status === 0;
}

console.log('==========================================');
console.log(' ai-sdd 插件验证');
console.log('==========================================\n');

// 1. Plugin
console.log('▶ [1/2] 验证插件配置...');
claudeValidate(REPO_ROOT) ? ok('插件 [ai-sdd] 验证通过') : bad('插件 [ai-sdd] 验证失败');
console.log('');

// 2. JSON format
console.log('▶ [2/2] 验证 JSON 文件格式...');
const jsonFiles = [
  path.join(REPO_ROOT, '.claude-plugin/plugin.json'),
];
for (const rel of ['hooks/hooks.json', 'mcp/mcp-config.json']) {
  const f = path.join(REPO_ROOT, rel);
  if (fs.existsSync(f)) jsonFiles.push(f);
}
for (const f of jsonFiles) {
  const rel = path.relative(REPO_ROOT, f);
  try {
    JSON.parse(fs.readFileSync(f, 'utf8'));
    ok(`JSON 格式正确：${rel}`);
  } catch {
    bad(`JSON 格式错误：${rel}`);
  }
}
console.log('');

console.log('==========================================');
console.log(` 验证完成：✅ ${pass} 通过 / ❌ ${fail} 失败`);
console.log('==========================================');
process.exit(fail === 0 ? 0 : 1);