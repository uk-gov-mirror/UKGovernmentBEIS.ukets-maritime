import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { take } from 'rxjs';

import { MaritimeAccountsService } from '@mrtm/api';

import { FeedbackBannerStore, PageHeadingComponent, ReturnToTaskOrActionPageComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { requestTaskQuery, RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import { empCommonQuery, TaskItemStatus } from '@requests/common';
import { EuXmlImportService } from '@requests/common/eu-xml-import/eu-xml-import.service';
import { EuXmlImportData, EuXmlImportResult } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { euXmlImportFormProvider } from '@requests/common/eu-xml-import/eu-xml-import-process/eu-xml-import-process.form-provider';
import { EuXmlImportSaveService } from '@requests/common/eu-xml-import/eu-xml-import-save.service';
import { TASK_FORM } from '@requests/common/task-form.token';
import { DataParserWizardStepComponent } from '@shared/components';
import { XmlValidationError } from '@shared/types';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-eu-xml-import-process',
  imports: [
    PageHeadingComponent,
    ReturnToTaskOrActionPageComponent,
    DataParserWizardStepComponent,
    ButtonDirective,
    PendingButtonDirective,
    WarningTextComponent,
    ReactiveFormsModule,
    RouterLink,
    LinkDirective,
  ],
  templateUrl: './eu-xml-import-process.component.html',
  providers: [euXmlImportFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EuXmlImportProcessComponent {
  private readonly store = inject(RequestTaskStore);
  private readonly parseService = inject(EuXmlImportService);
  private readonly saveService = inject(EuXmlImportSaveService);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly accountService = inject(MaritimeAccountsService);
  protected readonly formGroup = inject<UntypedFormGroup>(TASK_FORM);
  readonly taskType = this.store.select(requestTaskQuery.selectRequestTaskType);
  readonly accountId = this.store.select(requestTaskQuery.selectRequestTaskAccountId)();
  readonly accountImoNumber: WritableSignal<string | null> = signal(null);

  readonly hasInProgressSubtasks = computed(() => {
    const sectionsCompleted = this.store.select(empCommonQuery.selectEmpSectionsCompleted)() ?? {};

    return Object.keys(sectionsCompleted).some(
      (subtask) =>
        sectionsCompleted?.[subtask] != undefined &&
        sectionsCompleted?.[subtask] != null &&
        sectionsCompleted[subtask] !== TaskItemStatus.NOT_STARTED,
    );
  });

  readonly xmlErrors: WritableSignal<XmlValidationError[]> = signal([]);
  readonly parseWarnings: WritableSignal<XmlValidationError[]> = signal([]);
  readonly parsedData: WritableSignal<EuXmlImportData | null> = signal(null);
  readonly saveError: WritableSignal<boolean> = signal(false);
  readonly showConfirmation: WritableSignal<boolean> = signal(false);
  readonly wizardStep = viewChild(DataParserWizardStepComponent);

  uploadedFile: File | null = null;

  constructor() {
    effect(() => {
      if (isNil(this.accountId)) {
        return;
      }
      this.accountService
        .getMaritimeAccount(this.accountId)
        .pipe(take(1))
        .subscribe(({ account }) => {
          this.accountImoNumber.set(account.imoNumber);
        });
    });
  }

  async onFileSelect(event: Event) {
    const input = event.target as HTMLInputElement;
    this.resetState();

    const file = input.files?.[0];
    if (!file) return;

    this.uploadedFile = file;
    this.formGroup.controls['file'].setValue(file);

    if (this.formGroup.controls['file'].valid) {
      const xmlText = await file.text();
      const result: EuXmlImportResult = this.parseService.parse(xmlText, this.accountImoNumber());

      this.xmlErrors.set(result.errors ?? []);
      this.parseWarnings.set(result.warnings ?? []);
      if (!result.errors?.length && result.data) {
        this.parsedData.set(result.data);
      }
    }

    input.value = '';
  }

  onSubmit(showConfirmation: boolean) {
    if (!this.parsedData()) {
      if (!this.xmlErrors().length) {
        this.xmlErrors.set([{ row: null, column: null, message: 'Upload a file' }]);
      }
      this.wizardStep().isSummaryDisplayedSubject.next(true);
      return;
    }
    if (showConfirmation) {
      this.showConfirmation.set(true);
      return;
    }
    this.confirmImport();
  }

  confirmImport() {
    this.saveError.set(false);
    const data = this.parsedData();

    if (!data) {
      this.saveError.set(true);
      return;
    }

    this.saveService
      .save(data)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.feedbackBannerStore.setSuccessMessages(['The data import from the XML file was successful.']);
          this.router.navigate(['../'], { relativeTo: this.activatedRoute });
        },
        error: () => this.saveError.set(true),
      });
  }

  cancelConfirmation() {
    this.showConfirmation.set(false);
  }

  private resetState() {
    this.xmlErrors.set([]);
    this.parseWarnings.set([]);
    this.parsedData.set(null);
    this.saveError.set(false);
    this.showConfirmation.set(false);
  }
}
