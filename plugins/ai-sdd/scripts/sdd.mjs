#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseContract } from './lib/parse-contract.mjs';
import { runGate } from './lib/gate.mjs';
import { renderReport } from './lib/report.mjs';
import { scaffold } from './lib/scaffold.mjs';
import { verifyArtifacts } from './lib/verify-artifacts.mjs';
import { detectCommands } from './lib/detect-commands.mjs';
import { loadState, setState, canEnter, recordGate } from './lib/state.mjs';

const PHASE_ORDER = ['P1', 'P1p', 'P2', 'P3', 'P4', 'P5'];
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SKILLS_DIR = join(ROOT, 'skills');
const CONTRACTS_DIR = join('SDD', 'contracts');

function loadUpstream(file) {
  const dir = dirname(file);
  const selfPhase = parseContract(readFileSync(file, 'utf8')).frontmatter.phase;
  const selfRank = PHASE_ORDER.indexOf(selfPhase === 'P1p' ? 'P1' : selfPhase);
  const upstream = [];
  for (const f of readdirSync(dir)) {
    if (!f.endsWith('.md') || join(dir, f) === file) continue;
    const c = parseContract(readFileSync(join(dir, f), 'utf8'));
    const rank = PHASE_ORDER.indexOf(c.frontmatter.phase === 'P1p' ? 'P1' : c.frontmatter.phase);
    if (rank >= 0 && rank < selfRank) upstream.push(c);
  }
  return upstream;
}

const [cmd, ...args] = process.argv.slice(2);

try {
  if (cmd === 'gate') {
    const file = args[0];
    const text = readFileSync(file, 'utf8');
    const r = runGate({ text, upstream: loadUpstream(file) });
    process.stdout.write(renderReport(r.violations) + '\n');
    try {
      const phase = parseContract(text).frontmatter.phase;
      const name = basename(dirname(file));
      if (phase && name) recordGate(name, phase, r.ok, CONTRACTS_DIR);
    } catch { /* 状态回写失败不影响闸门判定 */ }
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === 'scaffold') {
    const force = args.includes('--force');
    const [phase, name] = args.filter(a => a !== '--force');
    const r = scaffold({ phase, name, contractsDir: join(CONTRACTS_DIR, name), skillsDir: SKILLS_DIR, force });
    if (r.skipped) process.stdout.write(`skipped: ${r.path} 已存在(${r.existingSize} bytes)，未覆盖以防丢失。确需重建加 --force。\n`);
    else process.stdout.write(`created: ${r.path}\n`);
    process.exit(0);
  } else if (cmd === 'scan-ids') {
    const c = parseContract(readFileSync(args[0], 'utf8'));
    process.stdout.write(JSON.stringify(c.ids, null, 2) + '\n');
    process.exit(0);
  } else if (cmd === 'trace-extract') {
    const c = parseContract(readFileSync(args[0], 'utf8'));
    process.stdout.write(JSON.stringify({ ids: c.ids, traces: c.traces }, null, 2) + '\n');
    process.exit(0);
  } else if (cmd === 'placeholder-scan') {
    const c = parseContract(readFileSync(args[0], 'utf8'));
    for (const p of c.placeholders) process.stdout.write(`@${p.line}: ${p.text}\n`);
    process.exit(c.placeholders.length ? 1 : 0);
  } else if (cmd === 'verify-artifacts') {
    const r = verifyArtifacts({ text: readFileSync(args[0], 'utf8'), cwd: process.cwd() });
    if (r.ok) process.stdout.write('verify-artifacts: PASS ✅\n');
    else for (const m of r.missing) process.stdout.write(`  - ${m}\n`);
    process.exit(r.ok ? 0 : 1);
  } else if (cmd === 'detect-commands') {
    const name = args[0];
    const r = detectCommands(process.cwd());
    if (name) for (const k of ['build', 'test', 'run']) setState(name, 'commands', k, r[k] || '', CONTRACTS_DIR);
    process.stdout.write(JSON.stringify(r, null, 2) + '\n');
    process.exit(0);
  } else if (cmd === 'state-set') {
    const [name, target, key, ...rest] = args;
    const s = setState(name, target, key, rest.join(' '), CONTRACTS_DIR);
    process.stdout.write(JSON.stringify(s, null, 2) + '\n');
    process.exit(0);
  } else if (cmd === 'state-show') {
    process.stdout.write(JSON.stringify(loadState(args[0], CONTRACTS_DIR), null, 2) + '\n');
    process.exit(0);
  } else if (cmd === 'can-enter') {
    const [name, phase] = args;
    const r = canEnter(name, phase, CONTRACTS_DIR);
    process.stdout.write(`${r.ok ? 'OK' : 'BLOCKED'}: ${r.reason}\n`);
    process.exit(r.ok ? 0 : 1);
  } else {
    process.stderr.write('用法: sdd <gate|scaffold|scan-ids|trace-extract|placeholder-scan|verify-artifacts|detect-commands|state-set|state-show|can-enter> ...\n');
    process.exit(2);
  }
} catch (e) {
  process.stderr.write(`错误: ${e.message}\n`);
  process.exit(2);
}
