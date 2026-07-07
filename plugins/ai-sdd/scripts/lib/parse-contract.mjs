// scripts/lib/parse-contract.mjs
const ID_KINDS = ['AC-FAIL', 'AC', 'NFR', 'DF', 'IU', 'ADR', 'Task', 'V']; // AC-FAIL 在 AC 前，避免误吞
const ID_RE = new RegExp(`\\b(${ID_KINDS.join('|')})-(\\d{1,})\\b`, 'g');
const PLACEHOLDER_RE = /<<<[^>]*>>>|<[a-zA-Z_]+>|\bTODO\b|\bTBD\b/g;

function parseFrontmatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (!m) return { fm, body: text };
  for (const line of m[1].split('\n')) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) fm[kv[1]] = kv[2].trim();
  }
  return { fm, body: text.slice(m[0].length) };
}

export function parseContract(text) {
  const { fm, body } = parseFrontmatter(text);

  const sectionTitles = [];
  const sections = [];
  let cur = null;
  for (const line of body.split('\n')) {
    const h = line.match(/^##\s+(.*?)\s*$/);
    if (h) {
      const title = h[1].replace(/^[A-Za-z0-9.\s]*?[:：]\s*/, '').trim();
      sectionTitles.push(title);
      cur = { title, lines: [] };
      sections.push(cur);
    } else if (cur) {
      cur.lines.push(line);
    }
  }

  const ids = Object.fromEntries(['AC','AC-FAIL','NFR','DF','IU','ADR','Task','V'].map(k => [k, []]));
  // Strip covers: annotations before collecting IDs to avoid counting referenced IDs as declared
  const bodyForIds = body.replace(/covers:\s*[^\n|]*/g, '');
  for (const m of bodyForIds.matchAll(ID_RE)) {
    const token = `${m[1]}-${m[2]}`;
    if (!ids[m[1]].includes(token)) ids[m[1]].push(token);
  }

  const traces = [];
  const TRACE_RE = /(IU|Task|V)-(\d+)[\s\S]{0,200}?covers:\s*([^\n|]+)/g;
  for (const m of body.matchAll(TRACE_RE)) {
    const covers = m[3].split(',').map(s => s.trim()).filter(s => /^[A-Za-z]+(-[A-Za-z]+)?-\d+$/.test(s));
    traces.push({ kind: m[1], id: `${m[1]}-${m[2]}`, covers });
  }

  const placeholders = [];
  body.split('\n').forEach((line, i) => {
    for (const m of line.matchAll(PLACEHOLDER_RE)) placeholders.push({ line: i + 1, text: m[0] });
  });

  const taskMap = new Map();
  for (const line of body.split('\n')) {
    const idm = line.match(/\bTask-(\d+)\b/);
    if (!idm) continue;
    const id = `Task-${idm[1]}`;
    const file = (line.match(/file:\s*([^\s|]+)/) || [])[1] || null;
    const test = (line.match(/test:\s*([^\s|]+)/) || [])[1] || null;
    const prev = taskMap.get(id) || { id, file: null, test: null };
    taskMap.set(id, { id, file: prev.file || file, test: prev.test || test });
  }
  const tasks = [...taskMap.values()];

  return { frontmatter: fm, sectionTitles, sections, ids, traces, tasks, placeholders };
}
