import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const TEMPLATE_PATH = {
  P1:  'sdd-p1/template.md',
  P1p: 'sdd-p1/template-p1p.md',
  P2:  'sdd-p2/template.md',
  P3:  'sdd-p3/template.md',
  P4:  'sdd-p4/template.md',
  P5:  'sdd-p5/template.md',
};

export function scaffold({ phase, name, contractsDir, skillsDir }) {
  const rel = TEMPLATE_PATH[phase];
  if (!rel) throw new Error(`未知 phase: ${phase}`);
  const raw = readFileSync(join(skillsDir, rel), 'utf8');
  const content = raw.replaceAll('<<<name>>>', name);
  const contractId = (content.match(/contract_id:\s*(.*)/) || [])[1].trim();
  mkdirSync(contractsDir, { recursive: true });
  const path = join(contractsDir, `${contractId}.md`);
  writeFileSync(path, content);
  return { path, content };
}
