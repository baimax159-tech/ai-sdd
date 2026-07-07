// scripts/lib/detect-commands.mjs — 从项目标记文件推断 build/test/run 命令
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export function detectCommands(cwd = process.cwd()) {
  const has = (f) => existsSync(join(cwd, f));

  if (has('go.mod')) return { lang: 'Go', build: 'go build ./...', test: 'go test ./...', run: 'go run .' };
  if (has('Cargo.toml')) return { lang: 'Rust', build: 'cargo build', test: 'cargo test', run: 'cargo run' };
  if (has('pom.xml')) return { lang: 'Java(Maven)', build: 'mvn -q compile', test: 'mvn -q test', run: 'mvn spring-boot:run' };
  if (has('build.gradle') || has('build.gradle.kts')) return { lang: 'Java(Gradle)', build: 'gradle build', test: 'gradle test', run: 'gradle bootRun' };

  if (has('package.json')) {
    let scripts = {};
    try { scripts = (JSON.parse(readFileSync(join(cwd, 'package.json'), 'utf8')).scripts) || {}; } catch { /* 解析失败按无脚本处理 */ }
    return {
      lang: 'Node',
      build: scripts.build ? 'npm run build' : '',
      test: scripts.test ? 'npm test' : '',
      run: scripts.start ? 'npm start' : (scripts.dev ? 'npm run dev' : ''),
    };
  }

  if (has('pyproject.toml') || has('requirements.txt') || has('setup.py')) {
    return { lang: 'Python', build: '', test: 'pytest', run: '' };
  }

  return { lang: 'unknown', build: '', test: '', run: '' };
}