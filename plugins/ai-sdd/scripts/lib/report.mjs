// scripts/lib/report.mjs
export function renderReport(violations) {
  if (violations.length === 0) return 'gate: PASS ✅';
  const byFamily = { structure: [], id: [], trace: [], coverage: [] };
  for (const v of violations) (byFamily[v.family] ||= []).push(v.message);
  const label = { structure: '结构', id: 'ID 唯一', trace: '追溯有效性', coverage: '正向覆盖(零缺失)' };
  let out = `gate: FAIL ❌（${violations.length} 项）\n`;
  for (const fam of ['structure', 'id', 'trace', 'coverage']) {
    if (byFamily[fam].length) out += `\n[${label[fam]}]\n` + byFamily[fam].map(m => `  - ${m}`).join('\n') + '\n';
  }
  return out;
}
