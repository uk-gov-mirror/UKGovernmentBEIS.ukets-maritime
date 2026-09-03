import { DestroyRef, Directive, ElementRef, inject, Renderer2, signal } from '@angular/core';

/**
 * Debounces activation of an element. Once clicked, the element stops
 * accepting any further activation — pointer, touch, the Enter key, or
 * assistive technology — for 3 seconds, so a slow navigation or submission
 * cannot be triggered twice. Two layers enforce this: `inert` and
 * `pointer-events: none` block real user interaction at the source (and
 * `aria-disabled` announces the state), while a capture-phase click listener
 * swallows anything that still gets through, such as programmatic clicks or
 * the click synthesized by the Enter key.
 */
@Directive({
  selector: '[netzDebounce]',
  standalone: true,
  host: {
    '[attr.inert]': 'debouncing() ? "" : null',
    '[style.pointer-events]': 'debouncing() ? "none" : null',
    '[attr.aria-disabled]': 'debouncing() ? "true" : null',
  },
})
export class DebounceDirective {
  static readonly DEBOUNCE_DURATION_MS = 5000;

  protected readonly debouncing = signal(false);
  private timer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;

    // Capture phase, so a swallowed click is stopped before it reaches the
    // bubble-phase listeners of other directives, such as `routerLink`.
    // Renderer2 is used because host listeners cannot bind to the capture phase.
    const unlisten = inject(Renderer2).listen(element, 'click', (event: Event) => this.handleClick(event), {
      capture: true,
    });

    inject(DestroyRef).onDestroy(() => {
      unlisten();
      clearTimeout(this.timer);
    });
  }

  private handleClick(event: Event): void {
    if (this.debouncing()) {
      event.preventDefault();
      event.stopImmediatePropagation();
      return;
    }

    this.debouncing.set(true);
    this.timer = setTimeout(() => this.debouncing.set(false), DebounceDirective.DEBOUNCE_DURATION_MS);
  }
}
