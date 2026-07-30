import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { ActivatedRouteStub, BasePage } from '@netz/common/testing';

import { DataSuppliersStore } from '@data-suppliers/+state';
import { DataSuppliersFormComponent } from '@data-suppliers/data-suppliers-form/data-suppliers-form.component';
import { mockDataSuppliers, singleDataSupplierItemCreateDTO } from '@data-suppliers/testing/data-suppliers.mock';

describe('DataSuppliersFormComponent', () => {
  class Page extends BasePage<DataSuppliersFormComponent> {}
  let component: DataSuppliersFormComponent;
  let fixture: ComponentFixture<DataSuppliersFormComponent>;
  let page: Page;
  let store: DataSuppliersStore;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSuppliersFormComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: new ActivatedRouteStub(),
        },
      ],
    }).compileComponents();

    store = TestBed.inject(DataSuppliersStore);
    store.setItems(mockDataSuppliers);

    fixture = TestBed.createComponent(DataSuppliersFormComponent);
    component = fixture.componentInstance;

    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display all HTML elements', () => {
    expect(page.heading1.textContent).toContain('Data supplier details');
  });

  it('should display error on empty form submit', () => {
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummary).toBeTruthy();
    expect(page.errorSummaryListContents.length).toEqual(2);

    expect(page.errorSummaryListContents).toEqual(['Enter the name of the data supplier', 'Enter the Public key URL']);
  });

  it('should display error for existing values', () => {
    page.setInputValue('#name', 'Maritime Analytics Ltd');
    page.setInputValue('#jwksUrl', 'https://myapi2.com');
    page.submitButton.click();
    fixture.detectChanges();

    expect(page.errorSummaryListContents).toEqual([
      'The name of the data supplier already exists. Enter a unique name.',
      'The Public key URL already exists. Enter a unique name.',
    ]);
  });

  it('should submit form', () => {
    const storeSpy = vi.spyOn(store, 'setNewItem');
    page.setInputValue('#name', singleDataSupplierItemCreateDTO.name);
    page.setInputValue('#jwksUrl', singleDataSupplierItemCreateDTO.jwksUrl);
    page.submitButton.click();
    fixture.detectChanges();

    expect(storeSpy).toHaveBeenCalledWith(singleDataSupplierItemCreateDTO);
  });
});
