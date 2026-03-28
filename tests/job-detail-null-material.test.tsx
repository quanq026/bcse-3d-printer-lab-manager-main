import test, { afterEach, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import React from 'react';
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { LanguageProvider } from '../src/contexts/LanguageContext';
import { PerformanceProvider } from '../src/contexts/PerformanceContext';
import { JobDetail } from '../src/pages/JobDetail';
import { JobStatus, MaterialSource } from '../src/types';

let cleanup: (() => Promise<void>) | null = null;

function installDom() {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/',
  });

  globalThis.window = dom.window as typeof globalThis.window;
  globalThis.document = dom.window.document;
  Object.defineProperty(globalThis, 'navigator', {
    configurable: true,
    value: dom.window.navigator,
  });
  Object.defineProperty(globalThis, 'HTMLElement', {
    configurable: true,
    value: dom.window.HTMLElement,
  });
  Object.defineProperty(globalThis, 'HTMLInputElement', {
    configurable: true,
    value: dom.window.HTMLInputElement,
  });
  Object.defineProperty(globalThis, 'Event', {
    configurable: true,
    value: dom.window.Event,
  });
  Object.defineProperty(globalThis, 'MouseEvent', {
    configurable: true,
    value: dom.window.MouseEvent,
  });
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: dom.window.localStorage,
  });
  Object.defineProperty(globalThis, 'sessionStorage', {
    configurable: true,
    value: dom.window.sessionStorage,
  });
  Object.defineProperty(globalThis, 'requestAnimationFrame', {
    configurable: true,
    value: (cb: FrameRequestCallback) => setTimeout(() => cb(Date.now()), 0),
  });
  Object.defineProperty(globalThis, 'cancelAnimationFrame', {
    configurable: true,
    value: (id: number) => clearTimeout(id),
  });
  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({}),
  });
}

beforeEach(() => {
  installDom();
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
});

afterEach(async () => {
  await cleanup?.();
  cleanup = null;
});

test('job detail renders fallback label when material type is missing', async () => {
  const rootElement = document.getElementById('root');
  if (!rootElement) throw new Error('Missing root element');

  const root = createRoot(rootElement);

  await act(async () => {
    root.render(
      <PerformanceProvider>
        <LanguageProvider>
          <JobDetail
            job={{
              id: 'JOB-1',
              userId: 'u1',
              userName: 'Student',
              jobName: 'Fallback material',
              description: '',
              fileName: 'sample.stl',
              estimatedTime: '',
              estimatedGrams: 0,
              actualGrams: 0,
              materialType: null as any,
              color: '',
              materialSource: MaterialSource.OWN,
              printMode: 'self',
              status: JobStatus.SUBMITTED,
              cost: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            onBack={() => {}}
          />
        </LanguageProvider>
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

  assert.match(document.body.textContent || '', /Chua khai bao|Tu mang/i);
});

