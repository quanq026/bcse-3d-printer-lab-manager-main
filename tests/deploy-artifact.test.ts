import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

test('deploy workflow packages src directory for runtime-shared modules', () => {
  const workflowPath = join(process.cwd(), '.github', 'workflows', 'deploy.yml');
  const workflow = readFileSync(workflowPath, 'utf8');

  assert.match(
    workflow,
    /tar -czf deploy-package\.tar\.gz[\s\S]*\bsrc\/\s*\\/m,
    'deploy artifact must include src/ because server runtime imports shared modules from src',
  );
});
