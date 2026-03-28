import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { PerformanceProvider } from '../src/contexts/PerformanceContext';
import { AuthProvider } from '../src/contexts/AuthContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { AdminSettings } from '../src/pages/AdminSettings';
import { installDom, installMatchMedia } from './helpers/dom';

let cleanup: (() => Promise<void>) | null = null;

async function renderSettings() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Missing root element');

  const root = createRoot(rootElement);
  await act(async () => {
    root.render(
      <PerformanceProvider>
        <LanguageProvider>
          <AuthProvider>
            <AdminSettings />
          </AuthProvider>
        </LanguageProvider>
      </PerformanceProvider>,
    );
    await Promise.resolve();
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
  globalThis.fetch = async () => new Response('{}', {
    status: 200,
    headers: { 'content-type': 'application/json' },
  });
});

afterEach(async () => {
  await cleanup?.();
  cleanup = null;
});

test('settings exposes visual performance options and persists the selected mode', async () => {
  await renderSettings();

  const autoOption = document.querySelector('button[data-performance-mode="auto"]');
  const fullOption = document.querySelector('button[data-performance-mode="full"]');

  assert.ok(autoOption, 'expected auto performance option');
  assert.ok(fullOption, 'expected full performance option');

  await act(async () => {
    fullOption?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    await Promise.resolve();
  });

  assert.equal(localStorage.getItem('lab_performance_preference'), 'full');
});
