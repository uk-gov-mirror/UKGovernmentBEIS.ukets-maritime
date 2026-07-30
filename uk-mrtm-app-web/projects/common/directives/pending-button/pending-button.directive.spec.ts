import { Component, inject } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { timer } from 'rxjs';

import { PendingRequestService } from '@netz/common/services';
import { BasePage } from '@netz/common/testing';
import { ButtonDirective } from '@netz/govuk-components';

import { PendingButtonDirective } from './pending-button.directive';

describe('PendingButtonDirective', () => {
  let directive: PendingButtonDirective;
  let fixture: ComponentFixture<TestComponent>;
  let page: Page;

  @Component({
    imports: [PendingButtonDirective, ButtonDirective],
    template: `
      <button netzPendingButton govukButton type="submit" (click)="startRequest()">Submit</button>
    `,
    providers: [PendingRequestService],
  })
  class TestComponent {
    private readonly pendingRequest = inject(PendingRequestService);

    startRequest() {
      timer(500).pipe(this.pendingRequest.trackRequest()).subscribe();
    }
  }

  class Page extends BasePage<TestComponent> {
    get button() {
      return this.query('button');
    }
  }

  beforeEach(() => {
    fixture = TestBed.createComponent(TestComponent);
    page = new Page(fixture);

    fixture.detectChanges();
    directive = fixture.debugElement.query(By.directive(PendingButtonDirective)).componentInstance;
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should disable the button if a request is pending', () => {
    vi.useFakeTimers();
    expect(page.button.disabled).toBeFalsy();

    page.button.click();
    fixture.detectChanges();
    expect(page.button.disabled).toBeTruthy();

    vi.advanceTimersByTime(500);
    fixture.detectChanges();
    expect(page.button.disabled).toBeFalsy();
    vi.useFakeTimers();
  });
});
