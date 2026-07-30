import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BasePage } from '@netz/common/testing';

import { DataSupplierAppointComponent } from '@verifiers/components/data-supplier/data-supplier-appoint/data-supplier-appoint.component';

describe('DataSupplierAppointComponent', () => {
  class Page extends BasePage<DataSupplierAppointComponent> {}

  let component: DataSupplierAppointComponent;
  let fixture: ComponentFixture<DataSupplierAppointComponent>;
  let page: Page;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSupplierAppointComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DataSupplierAppointComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTMLElements', () => {
    expect(page.heading1.textContent).toEqual('Appoint a data supplier');
    expect(page.errorSummary).toBeFalsy();
  });

  it('should display error when submit empty form', () => {
    page.submitButton.click();
    fixture.detectChanges();
    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummary.textContent).toContain('Select a data supplier');
  });
});
