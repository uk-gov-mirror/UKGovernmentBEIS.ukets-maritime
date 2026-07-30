import { ChangeDetectionStrategy, Component, inject, signal, viewChild, WritableSignal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { EmpRegisteredOwner } from '@mrtm/api';

import { FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, WarningTextComponent } from '@netz/govuk-components';

import { empCommonQuery, TASK_FORM } from '@requests/common';
import { MANDATE_SUB_TASK, MandateWizardStep } from '@requests/common/emp/subtasks/mandate';
import {
  addMandateFormGroup,
  mandateUploadFormProvider,
  uploadMandateCSVFormValidators,
} from '@requests/common/emp/subtasks/mandate/mandate-upload/mandate-upload.form-provider';
import {
  FlattenedRegisteredOwner,
  mandateCSVMapper,
  MandateUploadCSVFormModel,
} from '@requests/common/emp/subtasks/mandate/mandate-upload/mandate-upload.map';
import { mandateMap } from '@requests/common/emp/subtasks/subtask-list.map';
import { DataParserWizardStepComponent } from '@shared/components';
import { MandateRegisteredOwnersListSummaryTemplateComponent } from '@shared/components/summaries/emp/mandate/mandate-registered-owners-list-summary-template';
import { formatDateFromString } from '@shared/utils';
import Papa from 'papaparse';

@Component({
  selector: 'mrtm-mandate-upload',
  imports: [
    LinkDirective,
    ButtonDirective,
    DataParserWizardStepComponent,
    RouterLink,
    WarningTextComponent,
    MandateRegisteredOwnersListSummaryTemplateComponent,
    PageHeadingComponent,
    PendingButtonDirective,
  ],
  standalone: true,
  templateUrl: './mandate-upload.component.html',
  providers: [mandateUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MandateUploadComponent {
  protected readonly form = inject<FormGroup<MandateUploadCSVFormModel>>(TASK_FORM);
  private readonly store = inject(RequestTaskStore);
  private readonly taskService = inject(TaskService);
  private readonly activatedRoute: ActivatedRoute = inject(ActivatedRoute);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly title = inject(Title);

  private readonly dataParserWizardStep = viewChild.required(DataParserWizardStepComponent);

  wizardStep = MandateWizardStep;
  wizardMap = mandateMap;
  showConfirmation = false;
  existingOwners = this.store.select(empCommonQuery.selectMandateRegisteredOwnersList);
  readonly owners: WritableSignal<EmpRegisteredOwner[] | null> = signal(null);
  ownersCtrl = this.form.controls.owners;
  columnsCtrl = this.form.controls.columns;
  fileCtrl = this.form.controls.file;
  uploadedFile: File;

  onFileSelect(event: any) {
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(false);
    this.uploadedFile = event.target.files[0];
    this.fileCtrl.setValue(this.uploadedFile);

    if (this.fileCtrl.invalid) {
      this.displayFileErrors();
    } else {
      Papa.parse(this.uploadedFile, {
        header: true,
        transform: this.csvValuesTransformer,
        skipEmptyLines: true,
        complete: (result) => this.processCSVData(result),
      });
    }

    event.target.value = '';
  }

  private processCSVData(result: Papa.ParseResult<unknown>) {
    const processedData = mandateCSVMapper(result.data);

    this.columnsCtrl.setValue(result.meta.fields);
    this.ownersCtrl.clear();
    this.ownersCtrl.clearValidators();

    if (this.columnsCtrl.invalid) {
      this.displayColumnErrors();
    } else {
      processedData?.forEach((flattenedRegisteredOwner) =>
        this.ownersCtrl.push(addMandateFormGroup(flattenedRegisteredOwner)),
      );
      this.ownersCtrl.addValidators(uploadMandateCSVFormValidators(this.store));
      this.ownersCtrl.updateValueAndValidity();

      if (this.ownersCtrl.valid) {
        this.owners.update(() => this.getTransformedFormData(processedData));
      } else {
        this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
        this.owners.update(() => null);
      }
    }
  }

  /**
   * Transforms a CSV value and trims its content
   * If is empty string to null
   * If is of boolean type, then convert 'Yes', 'YES', 'NO' etc. to true or false
   * If is of fuelOriginType, then convert 'fossil'/'biofuel' to 'FOSSIL'/'BIOFUEL'
   */
  private csvValuesTransformer(value: string) {
    const trimmedValue = value?.trim();
    return trimmedValue === '' ? null : trimmedValue;
  }

  /**
   * Transforms FlattenedRegisteredOwner[] to EmpRegisteredOwner[],
   * Updates entries in existing Voyages
   * Creates or updates EmpRegisteredOwner found in CSV between multiple lines
   */
  private getTransformedFormData(flattenedRegisteredOwners: FlattenedRegisteredOwner[]): EmpRegisteredOwner[] {
    const processedOwnersMap = new Map<string, EmpRegisteredOwner>();
    flattenedRegisteredOwners.forEach((fro) => {
      let currentOwner: EmpRegisteredOwner = processedOwnersMap.get(fro.imoNumber);
      const shipOwnerDetails = this.store.select(
        empCommonQuery.selectRegisteredOwnerShipDetailByImoNumber(fro.shipImoNumber),
      )();

      if (currentOwner) {
        currentOwner.ships.push(shipOwnerDetails);
      } else {
        currentOwner = {
          uniqueIdentifier: crypto.randomUUID(),
          name: fro.name,
          imoNumber: fro.imoNumber,
          contactName: fro.contactName,
          email: fro.email,
          effectiveDate: formatDateFromString(fro.effectiveDate, null, true)?.toISOString(),
          ships: [shipOwnerDetails],
        };
      }

      processedOwnersMap.set(fro.imoNumber, currentOwner);
    });

    return Array.from(processedOwnersMap?.values());
  }

  /**
   * Since File errors should appear alone, temporarily set other formControl errors to null
   */
  private displayFileErrors() {
    this.columnsCtrl.setErrors(null);
    this.ownersCtrl.setErrors(null);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    this.owners.update(() => null);
  }

  /**
   * Since Column errors should appear alone, temporarily set other formControl errors to null
   */
  private displayColumnErrors() {
    this.fileCtrl.setErrors(null);
    this.ownersCtrl.setErrors(null);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    this.owners.update(() => null);
  }

  toggleConfirmation(value: boolean) {
    this.showConfirmation = value;
    this.showConfirmation
      ? this.title.setTitle(this.wizardMap.uploadOwnersConfirmation.title)
      : this.title.setTitle(this.wizardMap.uploadOwners.title);
  }

  onSubmit() {
    if (this.existingOwners()?.length && !this.showConfirmation) {
      this.toggleConfirmation(true);
    } else {
      this.taskService
        .saveSubtask(MANDATE_SUB_TASK, MandateWizardStep.UPLOAD_OWNERS, this.activatedRoute, this.owners())
        .subscribe(() => {
          const actionMsg = this.showConfirmation ? 'replaced' : 'uploaded';
          this.feedbackBannerStore.setSuccessMessages([
            `The registered owners file has been ${actionMsg} successfully`,
          ]);
        });
    }
  }
}
