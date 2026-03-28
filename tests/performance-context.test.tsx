import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import {
  PerformanceProvider,
  usePerformance,
} from '../src/contexts/PerformanceContext';
import { installDom, installMatchMedia } from './helpers/dom';

let cleanup: (() => Promise<void>) | null = null;

function Consumer() {
  const performance = usePerformance();

  return (
    <div>
      <span data-testid="preference">{performance.preferenceMode}</span>
      <span data-testid="effective">{performance.effectiveMode}</span>
      <span data-testid="motion">{performance.motionLevel}</span>
      <button type="button" onClick={() => performance.setPreferenceMode('full')}>
        Full
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

function text(id: string) {
  return document.querySelector(`[data-testid="${id}"]`)?.textContent;
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

test('provider defaults to auto preference and balanced effective mode without cache', async () => {
  await renderConsumer();

  assert.equal(text('preference'), 'auto');
  assert.equal(text('effective'), 'balanced');
  assert.equal(text('motion'), 'reduced');
});

test('provider respects reduced motion in auto mode', async () => {
  installMatchMedia(true);

  await renderConsumer();

  assert.equal(text('effective'), 'performance');
  assert.equal(text('motion'), 'off');
});

test('provider persists manual overrides to local storage', async () => {
  await renderConsumer();

  const button = document.querySelector('button');
  if (!button) throw new Error('Missing button');

  await act(async () => {
    button.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });

  assert.equal(text('preference'), 'full');
  assert.equal(text('effective'), 'full');
  assert.equal(localStorage.getItem('lab_performance_preference'), 'full');
});
