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

  // 5. quality: 内容质量闸——把原本只靠自觉的散文硬约束落成机检（见 phase-spec 标志位）
  const findSection = (needle) => {
    const s = c.sections.find(sec => sec.title.includes(needle));
    return s ? s.lines : null;
  };
  const VAGUE_CMD = ['-', '无', 'none', 'n/a', 'na', 'tbd'];

  // C — P2 验证命令锚点的 test 行必须是可执行命令（P3/P4 据此跑测试，不再现场猜）
  if (spec.commandAnchor) {
    const lines = findSection('验证命令锚点');
    if (lines) {
      const testRow = lines.find(l => /^\s*\|/.test(l) && /^\s*test\b/i.test(l.split('|')[1] || ''));
      if (!testRow) {
        violations.push({ family: 'quality', message: '验证命令锚点缺 test 行（需 build/test/run 三行，test 必填可执行命令）' });
      } else {
        const cmd = (testRow.split('|')[2] || '').replace(/`/g, '').trim();
        if (!cmd || VAGUE_CMD.includes(cmd.toLowerCase())) {
          violations.push({ family: 'quality', message: `验证命令锚点 test 命令为空或占位（当前: "${cmd}"）` });
        }
      }
    }
  }

  // A — P4 通过判据必须数值化（禁止"正常/成功"类空话）
  if (spec.numericCriteria) {
    for (const l of (findSection('通过判据') || [])) {
      const m = l.match(/^\s*[-|]\s*(V-\d+)\s*[:：]\s*(.+?)\s*\|?\s*$/);
      if (!m) continue;
      const val = m[2].replace(/`/g, '').trim();
      // 等效"通过"表达（全绿/PASS/无失败/fail=0 等）与数值/阈值同等有效，降低措辞摩擦
      const EQUIV_PASS = /全绿|绿|pass|通过|无失败|无报错|fail\s*[=＝]?\s*0|zero/i;
      if (val && !/[0-9<>=%]|≤|≥/.test(val) && !EQUIV_PASS.test(val)) {
        violations.push({ family: 'quality', message: `${m[1]} 通过判据非数值化: "${val}"（须含数值/阈值/比较，或"全绿/PASS/无失败"等等效表达）` });
      }
    }
  }

  // A — P4 验证命令必须可执行（不接受"人工检查"）
  if (spec.executableCommands) {
    for (const l of (findSection('验证命令') || [])) {
      const m = l.match(/^\s*[-|]\s*(V-\d+)\s*[:：]\s*(.+?)\s*\|?\s*$/);
      if (!m) continue;
      const cmd = m[2].replace(/`/g, '').trim();
      if (!cmd || /人工|手动|manual|待定|待补/i.test(cmd)) {
        violations.push({ family: 'quality', message: `${m[1]} 验证命令不可执行: "${cmd}"（无法自动化须给脚本并标注需人工执行）` });
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
