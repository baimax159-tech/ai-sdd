#!/usr/bin/env node
'use strict';
// 沙箱编排与数据驱动 check 引擎
// 用法：node scripts/test-sandbox.js <prep|check|clean> [args...]

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const REPO_ROOT    = path.resolve(__dirname, '..');
const SANDBOX_ROOT = path.join(REPO_ROOT, '.test-sandbox');
const FIXTURES_DIR = path.join(REPO_ROOT, 'tests', 'fixtures');
const EXPECT_DIR   = path.join(REPO_ROOT, 'tests', 'expectations');

const KNOWN = new Set(['files_exist','no_placeholder','valid_json','file_contains','json_contains','per_fixture']);

function die(msg) { console.error(`❌ ${msg}`); process.exit(1); }

function usage() {
  console.log(`用法：
  node scripts/test-sandbox.js prep  <skill> [fixture]   准备沙箱（复制 fixture）
  node scripts/test-sandbox.js check <skill> <dir>       对沙箱产物执行期望断言
  node scripts/test-sandbox.js clean <dir>               删除沙箱（先确认）`);
}

function defaultFixture(skill) {
  return { 'init-plus': 'java-maven' }[skill] || '';
}

function copyDirSync(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDirSync(s, d);
    else fs.copyFileSync(s, d);
  }
}

function validateExpectKeys(obj, file) {
  for (const k of Object.keys(obj))
    if (!KNOWN.has(k)) die(`期望文件含未知断言类型：${k}（${file}）`);
  for (const v of Object.values(obj.per_fixture || {}))
    for (const k of Object.keys(v))
      if (!KNOWN.has(k)) die(`per_fixture 含未知断言类型：${k}（${file}）`);
}

function deepGet(obj, dotPath) {
  return dotPath.split('.').filter(Boolean).reduce((o, k) => (o == null ? undefined : o[k]), obj);
}

function cmdPrep(args) {
  const skill = args[0];
  if (!skill) { usage(); die('缺少 skill 参数'); }
  const fixture = args[1] || defaultFixture(skill);
  if (!fixture) die(`未知 skill '${skill}'，请显式指定 fixture`);
  const src  = path.join(FIXTURES_DIR, fixture);
  if (!fs.existsSync(src)) {
    const avail = fs.readdirSync(FIXTURES_DIR).join(', ');
    die(`fixture 不存在：${src}（可用：${avail}）`);
  }
  const dest = path.join(SANDBOX_ROOT, `${skill}-${fixture}`);
  if (fs.existsSync(dest)) die(`沙箱已存在：${dest}（请先 clean 或换 fixture）`);
  copyDirSync(src, dest);
  console.log(`✅ 沙箱已准备：${dest}`);
  console.log('');
  console.log('下一步（人工）：');
  console.log(`  1. 进入目录 '${dest}'`);
  console.log(`  2. 在该目录真实调用 /forge-dev:${skill}，按真实场景回答交互提问`);
  console.log(`  3. 回仓库根跑：node scripts/test-sandbox.js check ${skill} '${dest}'`);
}

function cmdCheck(args) {
  const skill = args[0];
  const dir   = args[1];
  if (!skill) { usage(); die('缺少 skill 参数'); }
  if (!dir)   die('缺少沙箱目录参数');
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory())
    die(`沙箱目录不存在：${dir}（请先 prep 并真实跑 skill）`);

  const expectFile = path.join(EXPECT_DIR, `${skill}.json`);
  if (!fs.existsSync(expectFile))
    die(`未找到期望文件：${expectFile}（请补 tests/expectations/${skill}.json）`);

  const base = JSON.parse(fs.readFileSync(expectFile, 'utf8'));
  validateExpectKeys(base, expectFile);

  const dirBase = path.basename(dir);
  const fixture = dirBase.startsWith(`${skill}-`) ? dirBase.slice(skill.length + 1) : defaultFixture(skill);
  const pf = (base.per_fixture || {})[fixture] || {};

  const eff = {
    files_exist:    [...(base.files_exist    || []), ...(pf.files_exist    || [])],
    no_placeholder: [...(base.no_placeholder || []), ...(pf.no_placeholder || [])],
    valid_json:     [...(base.valid_json     || []), ...(pf.valid_json     || [])],
    file_contains:  Object.assign({}, base.file_contains  || {}, pf.file_contains  || {}),
    json_contains:  Object.assign({}, base.json_contains  || {}, pf.json_contains  || {}),
  };

  console.log(`检查沙箱：${dir}（skill=${skill}, fixture=${fixture}）`);
  let pass = 0, fail = 0;
  const ok  = (msg) => { console.log(`  ✅ ${msg}`); pass++; };
  const bad = (msg) => { console.log(`  ❌ ${msg}`); fail++; };

  for (const f of eff.files_exist)
    fs.existsSync(path.join(dir, f)) ? ok(`exists: ${f}`) : bad(`exists: ${f}`);

  for (const f of eff.no_placeholder) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) { bad(`no-placeholder: ${f} (缺失)`); continue; }
    const content = fs.readFileSync(fp, 'utf8');
    /\{\{[^}]+\}\}/.test(content) ? bad(`no-placeholder: ${f} (残留 {{}})`) : ok(`no-placeholder: ${f}`);
  }

  for (const f of eff.valid_json) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) { bad(`valid-json: ${f} (缺失)`); continue; }
    try { JSON.parse(fs.readFileSync(fp, 'utf8')); ok(`valid-json: ${f}`); }
    catch { bad(`valid-json: ${f} (非法 JSON)`); }
  }

  for (const [f, patterns] of Object.entries(eff.file_contains)) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) { for (const p of patterns) bad(`contains[${p}]: ${f} (缺失)`); continue; }
    const content = fs.readFileSync(fp, 'utf8');
    for (const pat of patterns)
      content.includes(pat) ? ok(`contains[${pat}]: ${f}`) : bad(`contains[${pat}]: ${f}`);
  }

  // json_contains format: { "file": { "dot.path": ["value1", "value2"] } }
  for (const [f, checks] of Object.entries(eff.json_contains)) {
    const fp = path.join(dir, f);
    if (!fs.existsSync(fp)) {
      for (const vals of Object.values(checks))
        for (const v of vals) bad(`json[${f}]: ${v} (缺失)`);
      continue;
    }
    let parsed;
    try { parsed = JSON.parse(fs.readFileSync(fp, 'utf8')); }
    catch {
      for (const vals of Object.values(checks))
        for (const v of vals) bad(`json[${f}]: (非法 JSON)`);
      continue;
    }
    for (const [dotPath, values] of Object.entries(checks)) {
      const node = deepGet(parsed, dotPath);
      for (const v of values)
        Array.isArray(node) && node.includes(v)
          ? ok(`json[${dotPath}=${v}]: ${f}`)
          : bad(`json[${dotPath}=${v}]: ${f}`);
    }
  }

  console.log('');
  console.log(`结果：✅ ${pass} / ❌ ${fail}`);
  process.exit(fail === 0 ? 0 : 1);
}

async function cmdClean(args) {
  const dir = args[0];
  if (!dir) die('缺少沙箱目录参数');
  if (!fs.existsSync(dir)) { console.log(`ℹ️ 无需清理（目录不存在）：${dir}`); return; }
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question(`确认删除沙箱 '${dir}'？[y/N] `, (ans) => {
    rl.close();
    if (ans === 'y' || ans === 'Y') {
      fs.rmSync(dir, { recursive: true, force: true });
      console.log(`✅ 已删除：${dir}`);
    } else {
      console.log('已取消，未删除。');
    }
  });
}

const [,, subcmd, ...rest] = process.argv;
switch (subcmd) {
  case 'prep':  cmdPrep(rest); break;
  case 'check': cmdCheck(rest); break;
  case 'clean': cmdClean(rest); break;
  case '-h': case '--help': case undefined: usage(); break;
  default: usage(); die(`未知子命令：${subcmd}`);
}