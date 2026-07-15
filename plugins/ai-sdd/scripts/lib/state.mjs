// scripts/lib/state.mjs — 跨阶段状态持久化（换 session/compact 不丢）
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { execSync } from 'node:child_process';

// 取当前 git HEAD（非 git 仓库或无 git 时返回空，不报错）
function gitHead() {
  try {
    return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
  } catch { return ''; }
}

export const PHASE_ORDER = ['P1', 'P2', 'P3', 'P4', 'P5'];

// P1p（迁移路径）在状态里归一到 P1
export function normalizePhase(phase) {
  return phase === 'P1p' ? 'P1' : phase;
}

export function contractDir(name, contractsRoot = join('SDD', 'contracts')) {
  return join(contractsRoot, name);
}

function statePath(name, contractsRoot) {
  return join(contractDir(name, contractsRoot), 'state.json');
}

function freshState(name) {
  const phases = {};
  for (const ph of PHASE_ORDER) phases[ph] = { gate: 'pending', confirmed: false };
  return {
    name,
    p0: { done: false },
    phases,
    commands: { build: '', test: '', run: '' },
    updated: new Date().toISOString(),
  };
}

export function loadState(name, contractsRoot) {
  const p = statePath(name, contractsRoot);
  if (existsSync(p)) return JSON.parse(readFileSync(p, 'utf8'));
  return freshState(name);
}

export function saveState(state, contractsRoot) {
  const p = statePath(state.name, contractsRoot);
  mkdirSync(dirname(p), { recursive: true });
  state.updated = new Date().toISOString();
  writeFileSync(p, JSON.stringify(state, null, 2) + '\n');
  return p;
}

function coerce(value) {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return value;
}

// target ∈ {p0, commands, P1..P5}；key 为该对象下的字段
export function setState(name, target, key, value, contractsRoot) {
  const state = loadState(name, contractsRoot);
  const t = normalizePhase(target);
  const v = coerce(value);
  if (t === 'p0') state.p0[key] = v;
  else if (t === 'commands') state.commands[key] = v;
  else if (PHASE_ORDER.includes(t)) {
    state.phases[t][key] = v;
    // 每次确认落盘时追加一条 {commit, at}，审计可回溯"原始确认版 vs 回补版"
    if (key === 'confirmed' && v === true) {
      const entry = { at: new Date().toISOString() };
      const h = gitHead();
      if (h) entry.commit = h;
      (state.phases[t].confirmHistory ??= []).push(entry);
    }
  }
  else throw new Error(`未知 target: ${target}（可选 p0 / commands / P1..P5）`);
  saveState(state, contractsRoot);
  return state;
}

// gate 跑完后回写本阶段结果（供 sdd.mjs gate 调用）
export function recordGate(name, phase, ok, contractsRoot) {
  return setState(name, normalizePhase(phase), 'gate', ok ? 'pass' : 'fail', contractsRoot);
}

// 能否进入 phase：上一阶段必须 gate=pass 且 confirmed=true
export function canEnter(name, phase, contractsRoot) {
  const target = normalizePhase(phase);
  const idx = PHASE_ORDER.indexOf(target);
  if (idx < 0) return { ok: false, reason: `未知 phase: ${phase}` };
  if (idx === 0) return { ok: true, reason: 'P1 无前置阶段' };
  const state = loadState(name, contractsRoot);
  const prev = PHASE_ORDER[idx - 1];
  const ps = state.phases[prev];
  const problems = [];
  if (ps.gate !== 'pass') problems.push(`${prev} gate 未绿（当前: ${ps.gate}）`);
  if (!ps.confirmed) problems.push(`${prev} 未经用户确认`);
  if (problems.length) return { ok: false, reason: problems.join('；') };
  return { ok: true, reason: `${prev} 已通过且已确认` };
}