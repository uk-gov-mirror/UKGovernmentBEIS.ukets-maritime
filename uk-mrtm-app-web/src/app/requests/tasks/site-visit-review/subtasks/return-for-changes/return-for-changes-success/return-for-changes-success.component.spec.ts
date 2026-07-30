import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub } from '@netz/common/testing';

import { ReturnForChangesSuccessComponent } from '@requests/tasks/site-visit-review/subtasks/return-for-changes/return-for-changes-success';

describe('ReturnForChangesSuccessComponent', () => {
  let component: ReturnForChangesSuccessComponent;
  let fixture: ComponentFixture<ReturnForChangesSuccessComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReturnForChangesSuccessComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub(),
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ReturnForChangesSuccessComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display default informative text', () => {
    const texts = fixture.debugElement.queryAll(By.css('.govuk-body')).map((el) => el.nativeElement.textContent);
    expect(texts).toEqual(['The operator will return the application to you when the amendments have been made.']);
  });
});
