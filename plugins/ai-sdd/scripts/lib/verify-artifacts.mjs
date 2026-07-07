import { existsSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseContract } from './parse-contract.mjs';

export function verifyArtifacts({ text, cwd }) {
  const c = parseContract(text);
  const missing = [];
  for (const t of c.tasks) {
    for (const [label, p] of [['目标文件', t.file], ['测试文件', t.test]]) {
      if (!p) { missing.push(`${t.id} 缺 ${label} 声明`); continue; }
      const abs = resolve(cwd, p);
      if (!existsSync(abs)) missing.push(`${t.id} ${label}不存在: ${p}`);
      else if (statSync(abs).size === 0) missing.push(`${t.id} ${label}为空: ${p}`);
    }
  }
  return { ok: missing.length === 0, missing };
}
