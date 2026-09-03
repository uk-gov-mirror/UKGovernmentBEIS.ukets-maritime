import { AsyncPipe } from '@angular/common';
import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  contentChildren,
  inject,
  input,
  OnInit,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';

import { combineLatest, map, Observable, startWith, switchMap, take } from 'rxjs';

import { ACCORDION, Accordion, accordionFactory } from './accordion';
import { AccordionItemComponent } from './accordion-item/accordion-item.component';

@Component({
  selector: 'govuk-accordion',
  imports: [AsyncPipe],
  standalone: true,
  template: `
    <div class="govuk-accordion" [id]="id()">
      <div class="govuk-accordion__controls">
        <button
          type="button"
          class="govuk-accordion__show-all"
          [attr.aria-expanded]="areExpanded$ | async"
          (click)="toggleAllSections()">
          <span
            class="govuk-accordion-nav__chevron"
            [class.govuk-accordion-nav__chevron--down]="(areExpanded$ | async) === false"></span>
          <span class="govuk-accordion__show-all-text">
            {{ (areExpanded$ | async) ? 'Hide all sections' : 'Show all sections' }}
          </span>
        </button>
      </div>
      <ng-content select="govuk-accordion-item" />
    </div>
  `,
  providers: [accordionFactory],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccordionComponent implements OnInit, AfterContentInit {
  private accordion = inject<Accordion>(ACCORDION);

  readonly id = input<string>('accordion');
  readonly openIndexes = input<number[]>([]);
  readonly cacheDisabled = input<boolean>(true);

  readonly accordionItems = contentChildren(AccordionItemComponent);

  readonly accordionItems$ = toObservable(this.accordionItems);

  areExpanded$: Observable<boolean>;

  ngOnInit(): void {
    this.accordion.id = this.id();
    this.accordion.openIndexes = this.openIndexes();
    this.accordion.cacheDisabled = this.cacheDisabled();
  }

  ngAfterContentInit(): void {
    this.areExpanded$ = this.accordionItems$.pipe(
      startWith(this.accordionItems()),
      switchMap((items: readonly AccordionItemComponent[]) => combineLatest(items.map((item) => item.isExpanded$))),
      map((areExpanded) => areExpanded.every((isExpanded) => isExpanded)),
    );
  }

  toggleAllSections: () => void = () =>
    this.areExpanded$
      .pipe(take(1))
      .subscribe((areExpanded) => this.accordionItems().forEach((item) => item.isExpanded.next(!areExpanded)));
}
