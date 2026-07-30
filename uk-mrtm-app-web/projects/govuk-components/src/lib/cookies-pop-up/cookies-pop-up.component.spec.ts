import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiesPopUpComponent } from './cookies-pop-up.component';

describe('CookiesPopUpComponent', () => {
  let component: CookiesPopUpComponent;
  let fixture: ComponentFixture<CookiesPopUpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiesPopUpComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CookiesPopUpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
