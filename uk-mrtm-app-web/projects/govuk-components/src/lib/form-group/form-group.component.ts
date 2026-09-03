import { Component, DestroyRef, inject, input, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlContainer, FormGroupDirective, NgForm, UntypedFormGroup } from '@angular/forms';

import { ErrorMessageComponent } from '../error-message';
import { FieldsetDirective, LegendDirective, LegendSizeType } from '../fieldset';

/*
  eslint-disable
  @angular-eslint/component-selector
*/
@Component({
  selector: 'div[govuk-form-group]',
  imports: [ErrorMessageComponent, FieldsetDirective, LegendDirective],
  standalone: true,
  templateUrl: './form-group.component.html',
  host: {
    '[class.govuk-!-display-block]': 'govukDisplayBlock',
    '[class.govuk-form-group]': 'govukFormGroupClass',
    '[class.govuk-form-group--error]': 'govukFormGroupErrorClass',
  },
})
export class FormGroupComponent implements OnInit {
  private readonly container = inject(ControlContainer, { self: true, optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private isSubmitted = false;

  readonly legend = input<string>();
  readonly legendSize = input<LegendSizeType>('medium');
  readonly hint = input<string>();

  readonly govukDisplayBlock = true;
  readonly govukFormGroupClass = true;
  get govukFormGroupErrorClass(): boolean {
    return this.shouldDisplayErrors;
  }

  constructor() {
    if (!this.container) {
      console.error('###FormGroupComponent### :: Could not find ControlContainer');
    }
  }

  get identifier(): string {
    return this.container?.path?.join('.') ?? '';
  }

  get group(): UntypedFormGroup {
    return this.container?.control as UntypedFormGroup;
  }

  get shouldDisplayErrors(): boolean {
    return this.group?.invalid && (!this.form || this.isSubmitted);
  }

  private get form(): FormGroupDirective | NgForm | null {
    return this.container &&
      (this.container.formDirective instanceof FormGroupDirective || this.container.formDirective instanceof NgForm)
      ? this.container.formDirective
      : null;
  }

  ngOnInit(): void {
    this.form?.ngSubmit.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => (this.isSubmitted = true));
  }
}
