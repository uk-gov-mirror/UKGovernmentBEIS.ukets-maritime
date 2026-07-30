import { provideHttpClient } from '@angular/common/http';
import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';

import { MrtmAccountDTO } from '@mrtm/api';

import { BasePage } from '@netz/common/testing';

import { OperatorAccountFormComponent } from '@accounts/components';
import { CountryService } from '@core/services/country.service';
import { CountryServiceStub } from '@registration/testing/country-service-stub';

describe('OperatorAccountFormComponent', () => {
  let page: Page;
  let hostComponent: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  class Page extends BasePage<TestComponent> {
    get allInputs() {
      return this.queryAll<HTMLInputElement>('input').map((el) => el.name);
    }
  }

  @Component({
    imports: [ReactiveFormsModule, OperatorAccountFormComponent],
    standalone: true,
    template: `
      <form [formGroup]="formGroup">
        <mrtm-operator-account-form />
      </form>
    `,
    schemas: [NO_ERRORS_SCHEMA],
  })
  class TestComponent {
    formGroup = new FormGroup<Record<keyof MrtmAccountDTO, FormControl>>({
      name: new FormControl<MrtmAccountDTO['name'] | null>(null),
      imoNumber: new FormControl<MrtmAccountDTO['imoNumber'] | null>(null),
      firstMaritimeActivityDate: new FormControl<MrtmAccountDTO['firstMaritimeActivityDate'] | null>(null),
      line1: new FormControl<MrtmAccountDTO['line1'] | null>(null),
      line2: new FormControl<MrtmAccountDTO['line2'] | null>(null),
      city: new FormControl<MrtmAccountDTO['city'] | null>(null),
      country: new FormControl<MrtmAccountDTO['country'] | null>(null),
      postcode: new FormControl<MrtmAccountDTO['postcode'] | null>(null),
      state: new FormControl<MrtmAccountDTO['state'] | null>(null),
    });
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [provideHttpClient(), { provide: CountryService, useClass: CountryServiceStub }],
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    hostComponent = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(hostComponent).toBeTruthy();
  });

  it('should show all applicable inputs', () => {
    expect(page.allInputs).toHaveLength(10);
  });
});
