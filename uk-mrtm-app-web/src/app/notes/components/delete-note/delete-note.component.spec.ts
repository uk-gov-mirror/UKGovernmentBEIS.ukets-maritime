import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter, Router } from '@angular/router';

import { of } from 'rxjs';

import { AccountNotesService } from '@mrtm/api';

import { ActivatedRouteStub, BasePage, MockType } from '@netz/common/testing';

import { DeleteNoteComponent } from '@notes/components';

describe('DeleteNoteComponent', () => {
  let component: DeleteNoteComponent;
  let fixture: ComponentFixture<DeleteNoteComponent>;
  let page: Page;
  let router: Router;

  const activatedRoute = new ActivatedRouteStub({ accountId: 1, noteId: 2 });
  const accountNotesService: MockType<AccountNotesService> = {
    deleteAccountNote: vi.fn().mockReturnValue(of(null)),
  };

  @Component({
    standalone: true,
    template: '',
  })
  class NoopComponent {}

  class Page extends BasePage<DeleteNoteComponent> {
    get submitButton() {
      return this.queryAll<HTMLButtonElement>('button')[0];
    }
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'accounts/1', component: NoopComponent }]),
        { provide: AccountNotesService, useValue: accountNotesService },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DeleteNoteComponent);
    component = fixture.componentInstance;
    page = new Page(fixture);
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should delete', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    page.submitButton.click();

    expect(accountNotesService.deleteAccountNote).toHaveBeenCalledTimes(1);
    expect(accountNotesService.deleteAccountNote).toHaveBeenCalledWith(2);

    expect(navigateSpy).toHaveBeenCalledTimes(1);
    expect(navigateSpy).toHaveBeenCalledWith([`../../../`], {
      relativeTo: activatedRoute,
      fragment: 'notes',
    });
  });
});
