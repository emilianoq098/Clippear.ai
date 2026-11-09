import { access } from 'node:fs/promises';

const requiredPaths = [
  'AGENTS.md',
  'TASKS.md',
  'docs/DATA_CONTEXT.md',
  'memory/glossary.md',
  'memory/context/stack.md',
  'apps/web/package.json',
  'apps/api/package.json',
  'apps/worker/package.json',
  'apps/mcp-server/package.json',
  'apps/ml-worker/pyproject.toml',
  'packages/ui/src/tokens.css',
  'packages/shared/package.json',
  'packages/providers/package.json',
  'packages/highlight-engine/package.json',
  'packages/editor-core/package.json',
  'packages/sdk/package.json',
  'docs/ARCHITECTURE.md',
  'docs/DECISIONS.md',
  'docker-compose.yml',
];

const missing = [];
for (const path of requiredPaths) {
  try {
    await access(new URL(`../${path}`, import.meta.url));
  } catch {
    missing.push(path);
  }
}

if (missing.length > 0) {
  console.error(`Missing required foundation files:\n- ${missing.join('\n- ')}`);
  process.exitCode = 1;
} else {
  console.log(`Foundation structure is complete (${requiredPaths.length} files checked).`);
}
