import { TitleCasePipe } from '@angular/common';
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormArray, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { By } from '@angular/platform-browser';

import { Observable, of } from 'rxjs';

import { RegulatorUsersAuthoritiesInfoDTO } from '@mrtm/api';

import { BasePage } from '@netz/common/testing';
import { TableComponent } from '@netz/govuk-components';

import { UsersTableDirective } from '@shared/directives';
import { UsersTableItem } from '@shared/types';

describe('UsersTableDirective', () => {
  let directive: UsersTableDirective;
  let page: Page;
  let fixture: ComponentFixture<TestComponent>;

  const mockRegulatorsRouteData: { regulators: RegulatorUsersAuthoritiesInfoDTO } = {
    regulators: {
      caUsers: [
        {
          userId: '1reg',
          firstName: 'Alfyn',
          lastName: 'Octo',
          authorityStatus: 'DISABLED',
          authorityCreationDate: '2020-12-14T12:38:12.846716Z',
        },
        {
          userId: '2reg',
          firstName: 'Therion',
          lastName: 'Path',
          authorityStatus: 'ACTIVE',
          authorityCreationDate: '2020-12-15T12:38:12.846716Z',
        },
        {
          userId: '3reg',
          firstName: 'Olberik',
          lastName: 'Traveler',
          authorityStatus: 'ACTIVE',
          authorityCreationDate: '2020-11-10T12:38:12.846716Z',
        },
        {
          userId: '4reg',
          firstName: 'andrew',
          lastName: 'webber',
          authorityStatus: 'ACTIVE',
          authorityCreationDate: '2021-01-10T12:38:12.846716Z',
        },
        {
          userId: '5reg',
          firstName: 'William',
          lastName: 'Walker',
          authorityStatus: 'PENDING',
          authorityCreationDate: '2021-02-8T12:38:12.846716Z',
        },
      ],
      editable: true,
    },
  };

  class Page extends BasePage<TestComponent> {
    get usersForm() {
      return this.query<HTMLFormElement>('form[id="users-form"]');
    }

    get nameSortingButton() {
      return this.usersForm.querySelector<HTMLButtonElement>('thead button');
    }

    get rows() {
      return Array.from(this.usersForm.querySelectorAll<HTMLTableRowElement>('tbody tr'));
    }

    get nameColumns() {
      return this.rows.map((row) => row.querySelector<HTMLInputElement>('td input').value);
    }
  }

  const expectUserOrderToBe = (indexes: number[]) =>
    expect(page.nameColumns.map((name) => name.trim())).toEqual(
      indexes.map((index) => `${mockRegulatorsRouteData.regulators.caUsers[index].firstName}`),
    );

  @Component({
    imports: [ReactiveFormsModule, UsersTableDirective, TableComponent, TitleCasePipe],
    standalone: true,
    template: `
      <form [formGroup]="usersForm" id="users-form">
        <govuk-table
          [columns]="[{ field: 'name', header: 'Name', isSortable: true }]"
          mrtmUsersTable
          [users]="users$"
          [form]="usersForm">
          <ng-template let-column="column" let-index="index" let-row="row">
            <ng-container formArrayName="usersArray">
              <ng-container [formGroupName]="index">
                @switch (column.field) {
                  @case ('name') {
                    <input type="text" formControlName="firstName" />
                  }
                  @default {
                    {{ row[column.field] | titlecase }}
                  }
                }
              </ng-container>
              <ng-template #bareField>{{ row[column.field] | titlecase }}</ng-template>
            </ng-container>
          </ng-template>
        </govuk-table>
      </form>
    `,
  })
  class TestComponent {
    users$: Observable<UsersTableItem[]> = of(mockRegulatorsRouteData.regulators.caUsers);
    usersForm = new FormGroup({
      usersArray: new FormArray([]),
    });
  }

  beforeEach(async () => {
    fixture = TestBed.createComponent(TestComponent);
    page = new Page(fixture);
    fixture.detectChanges();
    directive = fixture.debugElement.query(By.directive(UsersTableDirective)).injector.get(UsersTableDirective);
  });

  it('should create an instance', () => {
    expect(directive).toBeTruthy();
  });

  it('should initialize with default sorting by created date', () => {
    expectUserOrderToBe([2, 0, 1, 3, 4]);
  });

  it('should sort by name', () => {
    page.nameSortingButton.click();
    fixture.detectChanges();

    expectUserOrderToBe([0, 3, 2, 1, 4]);

    page.nameSortingButton.click();
    fixture.detectChanges();

    expectUserOrderToBe([4, 1, 2, 3, 0]);
  });
});
