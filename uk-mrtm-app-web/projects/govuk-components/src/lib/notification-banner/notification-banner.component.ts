import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';

@Component({
  selector: 'govuk-notification-banner',
  standalone: true,
  templateUrl: './notification-banner.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationBannerComponent implements AfterViewInit {
  readonly type = input<'success' | 'neutral'>('neutral');
  readonly heading = input<string>();
  readonly displayHeading = computed(() => this.heading() ?? (this.type() === 'success' ? 'Success' : 'Important'));

  readonly tabIndex = computed(() => (this.type() === 'success' ? -1 : null));

  private readonly bannerElement = viewChild<ElementRef<HTMLDivElement>>('banner');

  ngAfterViewInit(): void {
    if (this.tabIndex()) {
      this.bannerElement().nativeElement.focus();
    }
  }
}
