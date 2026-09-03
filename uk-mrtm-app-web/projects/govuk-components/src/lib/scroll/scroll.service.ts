import { Location, ViewportScroller } from '@angular/common';
import { inject, Service } from '@angular/core';
import { Router, Scroll } from '@angular/router';

import { filter } from 'rxjs';

export interface ScrollState {
  scrollSkip: boolean;
}

@Service()
export class ScrollService {
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly location = inject(Location);

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    this.router.events.pipe(filter((event) => event instanceof Scroll)).subscribe((event: Scroll) => {
      const state = this.location.getState() as ScrollState;
      if (!state?.scrollSkip && !event.anchor) {
        if (event.position) {
          // backward navigation
          this.viewportScroller.scrollToPosition(event.position);
        } else {
          // forward navigation
          this.viewportScroller.scrollToPosition([0, 0]);
        }
      }
    });
  }
}
