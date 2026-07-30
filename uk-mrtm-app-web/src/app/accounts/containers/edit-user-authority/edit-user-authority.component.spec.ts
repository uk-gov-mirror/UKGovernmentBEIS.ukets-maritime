import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';

import { OperatorUsersInvitationService, OperatorUsersService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass } from '@netz/common/testing';

import { EditUserAuthorityComponent } from '@accounts/containers/edit-user-authority/edit-user-authority.component';

describe('EditUserAuthorityComponent', () => {
  let component: EditUserAuthorityComponent;
  let fixture: ComponentFixture<EditUserAuthorityComponent>;

  const route = new ActivatedRouteStub({
    accountId: 1,
    userId: 'afbedc50-5418-4f68-ad0f-885189911281',
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditUserAuthorityComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: route },
        { provide: OperatorUsersInvitationService, useValue: mockClass(OperatorUsersInvitationService) },
        { provide: OperatorUsersService, useValue: mockClass(OperatorUsersService) },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditUserAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
