import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { throwError } from 'rxjs';

import { CaExternalContactDTO, CaExternalContactsService } from '@mrtm/api';

import { ErrorCodes } from '@netz/common/error';
import {
  ActivatedRouteStub,
  asyncData,
  BasePage,
  BusinessErrorStubComponent,
  expectBusinessErrorToBe,
  expectToHaveNavigatedTo,
  RouterStubComponent,
} from '@netz/common/testing';

import { saveNotFoundExternalContactError } from '@regulators/errors/business-error';
import { DeleteComponent } from '@regulators/external-contacts/delete/delete.component';
import { Mocked } from 'vitest';

describe('DeleteComponent', () => {
  let component: DeleteComponent;
  let fixture: ComponentFixture<DeleteComponent>;
  let page: Page;
  let externalContactsService: Partial<Mocked<CaExternalContactsService>>;

  const contact: CaExternalContactDTO = {
    id: 1,
    name: 'Bob Squarepants',
    email: 'bob_squarepants@test.gr',
    description: 'Bikini bottom contact',
    lastUpdatedDate: new Date('2021-01-08').toISOString(),
  };

  class Page extends BasePage<DeleteComponent> {
    get confirmButton() {
      return this.queryAll<HTMLButtonElement>('button')[0];
    }

    get cancelLink() {
      return this.queryAll<HTMLAnchorElement>('a').find((element) => element.textContent.trim() === 'Cancel');
    }

    get panelTitle() {
      return this.query<HTMLDivElement>('.govuk-panel__title');
    }

    get panelLink() {
      return this.query<HTMLAnchorElement>('a');
    }
  }

  beforeEach(async () => {
    externalContactsService = { deleteCaExternalContactById: vi.fn().mockReturnValue(asyncData(null)) };
    const activatedRoute = new ActivatedRouteStub(null, null, { contact });

    await TestBed.configureTestingModule({
      imports: [DeleteComponent, RouterStubComponent],
      providers: [
        provideRouter([
          { path: 'user', children: [{ path: 'regulators', component: RouterStubComponent }] },
          { path: 'error/business', component: BusinessErrorStubComponent },
        ]),
        { provide: CaExternalContactsService, useValue: externalContactsService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the confirmation dialog', () => {
    expect(page.cancelLink).toBeTruthy();
    expect(page.confirmButton).toBeTruthy();
    expect(page.confirmButton.disabled).toBeFalsy();
  });

  it('should cancel the deletion', async () => {
    page.cancelLink.click();
    await fixture.whenStable();

    expectToHaveNavigatedTo('/user/regulators#external-contacts');
  });

  it('should delete the contact', async () => {
    page.confirmButton.click();
    fixture.detectChanges();

    expect(externalContactsService.deleteCaExternalContactById).toHaveBeenCalledWith(contact.id);

    await fixture.whenStable();
    fixture.detectChanges();

    expect(page.panelTitle.textContent).toEqual('The external contact Bob Squarepants has been deleted');
    expect(page.panelLink.textContent.trim()).toEqual('Return to: Regulator users and contacts page');
    expect(page.panelLink.href).toContain('/user/regulators#external-contacts');
  });

  it('should dismiss with a message if error', async () => {
    externalContactsService.deleteCaExternalContactById.mockReturnValue(
      throwError(() => new HttpErrorResponse({ error: { code: ErrorCodes.EXTCONTACT1000 }, status: 400 })),
    );

    page.confirmButton.click();

    await expectBusinessErrorToBe(saveNotFoundExternalContactError);
  });
});
