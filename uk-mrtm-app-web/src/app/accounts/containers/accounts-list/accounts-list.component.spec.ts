import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { AccountSearchResultInfoDTO } from '@mrtm/api';

import { SortEvent, TableComponent } from '@netz/govuk-components';

import { AccountsListComponent } from '@accounts/containers';
import { mockMrtmAccountResults } from '@accounts/testing/accounts-data.mock';

describe('AccountsListComponent', () => {
  let component: AccountsListComponent;
  let fixture: ComponentFixture<AccountsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccountsListComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  describe('component properties', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AccountsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });
  });

  describe('with accounts input', () => {
    const accounts = mockMrtmAccountResults.accounts;

    beforeEach(() => {
      fixture = TestBed.createComponent(AccountsListComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('accounts', accounts);
      fixture.detectChanges();
    });

    it('should render a govuk-tag for each account', () => {
      const tags = fixture.nativeElement.querySelectorAll('govuk-tag');

      expect(tags.length).toBe(accounts.length);
    });

    it('should render each account name as an anchor link', () => {
      const links: NodeListOf<HTMLAnchorElement> = fixture.nativeElement.querySelectorAll('a');

      expect(links.length).toBe(accounts.length);
      accounts.forEach((account, i) => {
        expect(links[i].textContent?.trim()).toBe(account.name);
      });
    });
  });

  describe('with accounts of various statuses', () => {
    const accounts: AccountSearchResultInfoDTO[] = [
      { id: 1, name: 'Account A', businessId: 'EM00001', status: 'NEW' },
      { id: 2, name: 'Account B', businessId: 'EM00002', status: 'LIVE' },
      { id: 3, name: 'Account C', businessId: 'EM00003', status: 'WITHDRAWN' },
      { id: 4, name: 'Account D', businessId: 'EM00004', status: 'CLOSED' },
    ];

    beforeEach(() => {
      fixture = TestBed.createComponent(AccountsListComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('accounts', accounts);
      fixture.detectChanges();
    });

    it('should bind all 4 accounts to the signal', () => {
      expect(component.accounts()).toHaveLength(4);
    });

    it('should render a status tag for every account', () => {
      const tags = fixture.nativeElement.querySelectorAll('govuk-tag');

      expect(tags.length).toBe(4);
    });

    it('should render status text in title case', () => {
      const tags: NodeListOf<HTMLElement> = fixture.nativeElement.querySelectorAll('govuk-tag');

      expect(tags[0].textContent?.trim()).toBe('New');
      expect(tags[1].textContent?.trim()).toBe('Live');
      expect(tags[2].textContent?.trim()).toBe('Withdrawn');
      expect(tags[3].textContent?.trim()).toBe('Closed');
    });
  });

  describe('with an empty accounts list', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AccountsListComponent);
      component = fixture.componentInstance;
      fixture.componentRef.setInput('accounts', []);
      fixture.detectChanges();
    });

    it('should display the empty-table text', () => {
      expect(fixture.nativeElement.textContent).toContain('There are no results to show');
    });
  });

  describe('sort output', () => {
    beforeEach(() => {
      fixture = TestBed.createComponent(AccountsListComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
    });

    it('should emit the sort event from the table as-is', () => {
      const emitSpy = vi.spyOn(component.sort, 'emit');
      const event: SortEvent = { column: 'name', direction: 'ascending' };

      fixture.debugElement.query(By.directive(TableComponent)).componentInstance.sort.emit(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });

    it('should emit a descending sort event', () => {
      const emitSpy = vi.spyOn(component.sort, 'emit');
      const event: SortEvent = { column: 'status', direction: 'descending' };

      fixture.debugElement.query(By.directive(TableComponent)).componentInstance.sort.emit(event);

      expect(emitSpy).toHaveBeenCalledWith(event);
    });
  });
});
