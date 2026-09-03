import { AfterViewInit, Component, computed, contentChild, input, signal } from '@angular/core';
import { ControlValueAccessor, ReactiveFormsModule } from '@angular/forms';

import { distinctUntilChanged, startWith, takeUntil, tap } from 'rxjs';

import { LabelDirective } from '../directives';
import { ErrorMessageComponent } from '../error-message';
import { FormInput } from '../form/form-input';
import { SafeHtmlPipe } from '../pipes/safe-html.pipe';
import { LabelSizeType } from './label-size.type';

/*
  eslint-disable
  @angular-eslint/component-selector
*/
@Component({
  selector: 'div[govuk-textarea]',
  imports: [ReactiveFormsModule, ErrorMessageComponent, SafeHtmlPipe],
  standalone: true,
  templateUrl: './textarea.component.html',
})
export class TextareaComponent extends FormInput implements ControlValueAccessor, AfterViewInit {
  private static readonly WARNING_PERCENTAGE = 0.9;

  readonly label = input<string>();
  readonly labelSize = input<LabelSizeType>('normal');
  readonly isLabelHidden = input(false);
  readonly hint = input<string>();
  readonly rows = input('5');
  readonly maxLength = input<number>();

  readonly templateLabel = contentChild(LabelDirective);

  readonly valueLength = signal(0);
  readonly currentLabelSize = computed(() => {
    switch (this.labelSize()) {
      case 'small':
        return 'govuk-label govuk-label--s';
      case 'medium':
        return 'govuk-label govuk-label--m';
      case 'large':
        return 'govuk-label govuk-label--l';
      default:
        return 'govuk-label';
    }
  });

  onBlur: (_: any) => any;

  constructor() {
    super();
  }

  writeValue(): void {}

  registerOnChange(): void {}

  registerOnTouched(onBlur: any): void {
    this.onBlur = onBlur;
  }

  setDisabledState(): void {}

  getInputValue(event: Event): string {
    return (event.target as HTMLTextAreaElement).value;
  }

  handleBlur(value: string): void {
    this.onBlur(value);
  }

  exceedsMaxLength(length: number): boolean {
    return length > this.maxLength();
  }

  approachesMaxLength(length: number): boolean {
    return !this.exceedsMaxLength(length) && length >= this.maxLength() * TextareaComponent.WARNING_PERCENTAGE;
  }

  ngAfterViewInit(): void {
    this.control.valueChanges
      .pipe(
        startWith(this.control.value),
        distinctUntilChanged((prev, curr) => prev === curr),
        tap((value) => {
          const trimmedValue = value ? (value.trim() === '' ? null : value.trim()) : value;
          this.control.setValue(trimmedValue, {
            emitEvent: false,
            emitViewToModelChange: false,
            emitModelToViewChange: false,
          });
          this.valueLength.set(trimmedValue?.length ?? 0);
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }
}
