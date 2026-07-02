// scripts/lib/gate.mjs
import { parseContract } from './parse-contract.mjs';
import { PHASE_SPEC } from './phase-spec.mjs';

export function runGate({ text, upstream = [] }) {
  const c = parseContract(text);
  const phase = c.frontmatter.phase;
  const spec = PHASE_SPEC[phase];
  let violations = [];

  if (!spec) {
    violations.push({ family: 'structure', message: `未知 phase: ${phase ?? '(缺失)'}` });
    return { ok: false, violations };
  }

  // 1. structure: 必备小节
  for (const need of spec.requiredSections) {
    if (!c.sectionTitles.some(t => t.includes(need))) {
      violations.push({ family: 'structure', message: `缺必备小节: ${need}` });
    }
  }
  // 1b. 占位符残留
  for (const p of c.placeholders) {
    violations.push({ family: 'structure', message: `占位符残留 @${p.line}: ${p.text}` });
  }

  // 1c. P3 规划期闸：每个 Task 必须声明非空 file:/test:（§4.3 双闸之一，挡规划泄漏）
  if (spec.taskArtifacts) {
    for (const t of c.tasks) {
      for (const field of spec.taskArtifacts) {
        if (!t[field]) violations.push({ family: 'structure', message: `${t.id} 缺 ${field}:（规划期闸：每个 Task 须有目标文件与测试文件）` });
      }
    }
  }

  // 2. id 唯一：只统计「声明行」。
  //    声明位置：表格首列、#/## 级标题、列表项开头。
  //    跳过：covers: 行、Stage 行、### 及更深子标题（协议分节标题）。
  //    列表项只取开头 ID 为声明，行内其他 ID 视为引用（如依赖列表）。
  const counts = {};
  for (const line of text.split('\n')) {
    if (/covers:/.test(line)) continue;
    if (/Stage\s+\d/i.test(line)) continue;

    if (/^\s*\|/.test(line)) {
      const cols = line.split('|');
      const firstCol = cols[1] || '';
      for (const m of firstCol.matchAll(/\b(AC-FAIL|AC|NFR|DF|IU|ADR|Task|V)-(\d{1,})\b/g)) {
        const tk = `${m[1]}-${m[2]}`; counts[tk] = (counts[tk] || 0) + 1;
      }
    } else if (/^#{1,2}\s/.test(line)) {
      for (const m of line.matchAll(/\b(AC-FAIL|AC|NFR|DF|IU|ADR|Task|V)-(\d{1,})\b/g)) {
        const tk = `${m[1]}-${m[2]}`; counts[tk] = (counts[tk] || 0) + 1;
      }
    } else if (/^\s*-\s/.test(line)) {
      const itemText = line.replace(/^\s*-\s+/, '');
      const m = itemText.match(/^(AC-FAIL|AC|NFR|DF|IU|ADR|Task|V)-(\d{1,})\b\s*(?![:：])/);
      if (m) {
        const tk = `${m[1]}-${m[2]}`; counts[tk] = (counts[tk] || 0) + 1;
      }
    }
  }
  // 仅对本阶段自有 ID 种类判重
  for (const [tk, n] of Object.entries(counts)) {
    const kind = tk.replace(/-\d+$/, '');
    if (spec.idKinds.includes(kind) && n > 1) {
      violations.push({ family: 'id', message: `ID 疑似重号: ${tk}（出现 ${n} 次）` });
    }
  }

  // 3. trace: 下游 covers 必须命中上游 ID 集
  if (spec.traceKind) {
    const upstreamIds = new Set();
    for (const u of upstream) {
      for (const kind of spec.traceUpstream) for (const id of (u.ids[kind] || [])) upstreamIds.add(id);
    }
    const downstream = c.traces.filter(t => t.kind === spec.traceKind);
    if (downstream.length === 0) {
      violations.push({ family: 'trace', message: `无任何 ${spec.traceKind} 追溯声明（需 covers: 上游 ID）` });
    }
    for (const t of downstream) {
      if (t.covers.length === 0) violations.push({ family: 'trace', message: `${t.id} 缺 covers` });
      for (const ref of t.covers) {
        if (!upstreamIds.has(ref)) violations.push({ family: 'trace', message: `${t.id} 追溯到不存在的上游 ID: ${ref}` });
      }
    }
  }

  // 4. coverage: 上游受管 ID 必须被下游 covers 100% 覆盖（零缺失）
  if (spec.coverageRequired.length) {
    const coveredByDownstream = new Set();
    for (const t of c.traces.filter(t => t.kind === spec.traceKind)) {
      for (const ref of t.covers) coveredByDownstream.add(ref);
    }
    for (const u of upstream) {
      for (const kind of spec.coverageRequired) {
        for (const id of (u.ids[kind] || [])) {
          if (!coveredByDownstream.has(id)) {
            violations.push({ family: 'coverage', message: `上游 ${id} 未被任何 ${spec.traceKind} 覆盖（要求 100% 覆盖，零缺失）` });
          }
        }
      }
    }
  }

  // 去重：同一 family+message 只保留一次（真实 P2 可能在散文里再提某个 IU id）
  const seen = new Set();
  violations = violations.filter(v => {
    const k = v.family + '|' + v.message;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return { ok: violations.length === 0, violations };
}
