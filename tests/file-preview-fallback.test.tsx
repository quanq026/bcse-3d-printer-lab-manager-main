import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { PerformanceProvider } from '../src/contexts/PerformanceContext';
import { LanguageProvider } from '../src/contexts/LanguageContext';
import { FilePreview } from '../src/components/FilePreview';
import { installDom, installMatchMedia } from './helpers/dom';

let cleanup: (() => Promise<void>) | null = null;

function createStlFile() {
  const stl = 'solid test\nfacet normal 0 0 1\nouter loop\nvertex 0 0 0\nvertex 1 0 0\nvertex 0 1 0\nendloop\nendfacet\nendsolid test';
  return new File([stl], 'sample.stl', { type: 'model/stl' });
}

async function renderPreview() {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Missing root element');

  const root = createRoot(rootElement);
  await act(async () => {
    root.render(
      <PerformanceProvider>
        <LanguageProvider>
          <div style={{ width: '300px', height: '220px' }}>
            <FilePreview file={createStlFile()} />
          </div>
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
  Object.defineProperty(window.HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => null,
  });
});

afterEach(async () => {
  await cleanup?.();
  cleanup = null;
});

test('file preview falls back when webgl renderer cannot initialize', async () => {
  await renderPreview();

  assert.match(document.body.textContent || '', /Không thể xem trước|Khong the xem truoc/i);
});
