#!/usr/bin/env node
'use strict';
// 通过伪造产物验证 check 引擎，不依赖真实 claude。
// 用法：node tests/selftest.js（应输出 ALL PASS）

const fs   = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const REPO_ROOT = path.resolve(__dirname, '..');
const TS = path.join(REPO_ROOT, 'scripts', 'test-sandbox.js');
const tmp = fs.mkdtempSync(path.join(require('os').tmpdir(), 'selftest-'));
process.on('exit', () => fs.rmSync(tmp, { recursive: true, force: true }));

let fail = 0;

function run(skill, dir) {
  return spawnSync('node', [TS, 'check', skill, dir], { encoding: 'utf8' });
}

function mkInitplusOk(d) {
  fs.mkdirSync(path.join(d, '.claude', 'rules', 'project'), { recursive: true });
  fs.mkdirSync(path.join(d, '.claude', 'rules', 'module'),  { recursive: true });
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), 'build: mvn clean package\n');
  for (const f of ['build-test', 'coding-standards', 'business-domain'])
    fs.writeFileSync(path.join(d, '.claude', 'rules', 'project', `${f}.md`), 'x');
  for (const f of ['api-module', 'service-module', 'config-module'])
    fs.writeFileSync(path.join(d, '.claude', 'rules', 'module', `${f}.md`), 'x');
}

// case1: 合格 init-plus（java-maven）应通过
{
  const d = path.join(tmp, 'c1', 'init-plus-java-maven');
  mkInitplusOk(d);
  const r = run('init-plus', d);
  if (r.status === 0) console.log('✅ case1');
  else { console.log('❌ case1 应通过却失败\n' + r.stdout + r.stderr); fail = 1; }
}

// case2: 缺 business-domain.md 应失败
{
  const d = path.join(tmp, 'c2', 'init-plus-java-maven');
  mkInitplusOk(d);
  fs.rmSync(path.join(d, '.claude', 'rules', 'project', 'business-domain.md'));
  const r = run('init-plus', d);
  if (r.status !== 0) console.log('✅ case2');
  else { console.log('❌ case2 应失败却通过'); fail = 1; }
}

// case3: CLAUDE.md 残留占位符应失败
{
  const d = path.join(tmp, 'c3', 'init-plus-java-maven');
  mkInitplusOk(d);
  fs.writeFileSync(path.join(d, 'CLAUDE.md'), 'build: {{BUILD_COMMAND}}\n');
  const r = run('init-plus', d);
  if (r.status !== 0) console.log('✅ case3');
  else { console.log('❌ case3 占位符应失败却通过'); fail = 1; }
}

if (fail === 0) { console.log('ALL PASS'); process.exit(0); }
else { console.log('SELFTEST FAILED'); process.exit(1); }