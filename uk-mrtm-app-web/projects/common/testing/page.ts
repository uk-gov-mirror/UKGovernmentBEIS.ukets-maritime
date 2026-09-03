import { ComponentFixture } from '@angular/core/testing';

import { convertToUTCDate } from './date-helpers';
import { changeInputValue, getInputValue } from './input-helpers';

export class BasePage<C> {
  private element: HTMLElement;

  constructor(protected readonly fixture: ComponentFixture<C>) {
    this.element = fixture.nativeElement;
  }

  sanitizeSelector(selector: string): string {
    return selector.replace(/\./g, '\\.');
  }

  query<T extends keyof HTMLElementTagNameMap>(selector: T): HTMLElementTagNameMap[T];
  query<E extends Element = Element>(selector: string): E | null;
  query<T extends keyof HTMLElementTagNameMap, E extends Element = Element>(
    selector: T,
  ): HTMLElementTagNameMap[T] | E | null {
    return this.element.querySelector<T>(selector);
  }

  queryAll<T extends keyof HTMLElementTagNameMap>(selector: T): HTMLElementTagNameMap[T][];
  queryAll<E extends Element = Element>(selector: string): E[];
  queryAll<T extends keyof HTMLElementTagNameMap, E extends Element = Element>(
    selector: T,
  ): HTMLElementTagNameMap[T][] | E[] {
    return Array.from(this.element.querySelectorAll<T>(selector));
  }

  getInputValue<T = string>(selector: string | HTMLInputElement | HTMLSelectElement): T {
    return getInputValue(this.fixture, selector instanceof Element ? selector : this.sanitizeSelector(selector));
  }

  setInputValue(selector: string, value?: any): void {
    changeInputValue(this.fixture, this.sanitizeSelector(selector), value);
  }

  getDateInputValue(selector: string): Date {
    const day = ('0' + this.getInputValue(`${selector}-day`)).slice(-2);
    const month = ('0' + this.getInputValue(`${selector}-month`)).slice(-2);
    const year = this.getInputValue(`${selector}-year`);
    return convertToUTCDate(new Date(`${year}-${month}-${day}`));
  }

  setDateInputValue(selector: string, value: Date) {
    this.setInputValue(`${selector}-day`, value.getDate());
    this.setInputValue(`${selector}-month`, value.getMonth() + 1);
    this.setInputValue(`${selector}-year`, value.getFullYear());
  }

  get heading1(): HTMLHeadingElement {
    return this.query<HTMLHeadingElement>('h1');
  }

  get heading2(): HTMLHeadingElement {
    return this.query<HTMLHeadingElement>('h2');
  }

  get heading3(): HTMLHeadingElement {
    return this.query<HTMLHeadingElement>('h3');
  }

  get heading4(): HTMLHeadingElement {
    return this.query<HTMLHeadingElement>('h4');
  }

  get paragraph(): HTMLParagraphElement {
    return this.query<HTMLParagraphElement>('p');
  }

  get paragraphs(): HTMLParagraphElement[] {
    return this.queryAll<HTMLParagraphElement>('p');
  }

  get fileDeleteButtons(): HTMLButtonElement[] {
    return this.queryAll<HTMLButtonElement>('.moj-multi-file-upload__delete');
  }

  set filesValue(value: File[]) {
    this.setInputValue('input[type="file"]', value);
  }

  get filesText(): string[] {
    return this.queryAll<HTMLDivElement>('.moj-multi-file-upload__message')?.map((row) => row.textContent.trim());
  }

  get summariesContents(): string[] {
    return this.queryAll<HTMLDListElement>('dl dt, dl dd').map((dd) => dd.textContent.trim());
  }

  get tableContents(): string[] {
    return this.queryAll<HTMLDListElement>('table th, table td').map((cell) => cell.textContent.trim());
  }

  get listContents(): string[] {
    return this.queryAll<HTMLLIElement>('ul > li').map((li) => li.textContent.trim());
  }

  get errorSummary(): HTMLDivElement {
    return this.query<HTMLDivElement>('.govuk-error-summary');
  }

  get errorSummaryListContents(): string[] {
    return Array.from(this.errorSummary.querySelectorAll<HTMLAnchorElement>('a')).map((anchor) =>
      anchor.textContent.trim(),
    );
  }

  get link(): HTMLAnchorElement {
    return this.query<HTMLAnchorElement>('a.govuk-link');
  }

  get standardButton(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('button[type="button"]');
  }

  get submitButton(): HTMLButtonElement {
    return this.query<HTMLButtonElement>('button[type="submit"]');
  }
}
