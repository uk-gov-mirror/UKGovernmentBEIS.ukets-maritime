import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { DataSupplierComponent } from '@verifiers/components/data-supplier/data-supplier.component';

describe('DataSupplierComponent', () => {
  let component: DataSupplierComponent;
  let fixture: ComponentFixture<DataSupplierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DataSupplierComponent],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(DataSupplierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
