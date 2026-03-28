import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { PerformanceProvider, usePerformance } from '../src/contexts/PerformanceContext';
import { installDom, installMatchMedia } from './helpers/dom';

let cleanup: (() => Promise<void>) | null = null;

function Consumer() {
  const performance = usePerformance();

  return (
    <div>
      <span data-testid="effective">{performance.effectiveMode}</span>
      <button
        type="button"
        onClick={() => performance.recordSample('preview', { averageFps: 20, stalledFrames: 3 })}
      >
        Sample
      </button>
    </div>
  );
}

async function renderConsumer() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Missing root element');

  const root = createRoot(rootElement);
  await act(async () => {
    root.render(
      <PerformanceProvider>
        <Consumer />
      </PerformanceProvider>,
    );
    await Promise.resolve();
  });

  cleanup = async () => {
    await act(async () => {
      root.unmount();
      await Promise.resolve();
    });
  };
}

beforeEach(() => {
  installDom();
  installMatchMedia(false);
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  await cleanup?.();
  cleanup = null;
});

test('preview sample downgrades auto mode and persists the cached profile', async () => {
  await renderConsumer();

  const button = document.querySelector('button');
  if (!button) throw new Error('Missing sample button');

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });

  assert.equal(document.querySelector('[data-testid="effective"]')?.textContent, 'performance');
  assert.match(localStorage.getItem('lab_performance_auto_profile') || '', /"effectiveMode":"performance"/);
});
