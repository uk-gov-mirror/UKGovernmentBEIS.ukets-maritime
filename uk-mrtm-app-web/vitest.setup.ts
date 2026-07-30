import { vi } from 'vitest';

Object.assign(HTMLElement.prototype, {
  scrollIntoView: vi.fn(),
});

// jsdom backs `document.cookie` with tough-cookie, which allocates a Promise per
// access and trips vitest's detectAsyncLeaks (e.g. CookiesService on AppComponent
// init). No spec relies on jsdom's cookie-domain semantics, so replace it with a
// simple in-memory string store reset before each test.
let cookieStore = '';
Object.defineProperty(document, 'cookie', {
  configurable: true,
  get: () => cookieStore,
  set: (value: string) => {
    const [pair] = value.split(';');
    const [name] = pair.split('=');
    const existing = cookieStore.split('; ').filter((c) => c && c.split('=')[0] !== name);
    cookieStore = [...existing, pair].join('; ');
  },
});

const mockShow = vi.fn(function (this: HTMLDialogElement) {
  this.open = true;
});

const mockClose = vi.fn(function (this: HTMLDialogElement) {
  this.open = false;
});

Object.defineProperties(HTMLDialogElement.prototype, {
  show: { value: mockShow, writable: true },
  showModal: { value: mockShow, writable: true },
  close: { value: mockClose, writable: true },
});
