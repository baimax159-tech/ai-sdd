import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATE_PATH = {
  P1:  'sdd-p1/template.md',
  P1p: 'sdd-p1/template-p1p.md',
  P2:  'sdd-p2/template.md',
  P3:  'sdd-p3/template.md',
  P4:  'sdd-p4/template.md',
  P5:  'sdd-p5/template.md',
};

export function scaffold({ phase, name, contractsDir, skillsDir, force = false }) {
  const rel = TEMPLATE_PATH[phase];
  if (!rel) throw new Error(`未知 phase: ${phase}`);
  const raw = readFileSync(join(skillsDir, rel), 'utf8');
  const content = raw.replaceAll('<<<name>>>', name);
  const contractId = (content.match(/contract_id:\s*(.*)/) || [])[1].trim();
  mkdirSync(contractsDir, { recursive: true });
  const path = join(contractsDir, `${contractId}.md`);
  // 目标已存在且明显大于空模板 → 视为已填好的契约，不无提示覆盖（除非 --force）
  if (!force && existsSync(path) && statSync(path).size > content.length) {
    return { path, content, skipped: true, existingSize: statSync(path).size };
  }
  writeFileSync(path, content);
  return { path, content, skipped: false };
}
