import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { AerShipAggregatedDataSave } from '@mrtm/api';

import { FeedbackBannerStore, PageHeadingComponent } from '@netz/common/components';
import { PendingButtonDirective } from '@netz/common/directives';
import { TaskService } from '@netz/common/forms';
import { RequestTaskStore } from '@netz/common/store';
import { ButtonDirective, LinkDirective, TableComponent, WarningTextComponent } from '@netz/govuk-components';

import { aerCommonQuery } from '@requests/common/aer/+state';
import { AerSubmitTaskPayload } from '@requests/common/aer/aer.types';
import {
  AER_AGGREGATED_DATA_SUB_TASK,
  AerAggregatedDataWizardStep,
} from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data.helpers';
import { aerAggregatedDataSubtasksListMap } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-subtasks-list.map';
import { aerAggregatedDataUploadTableXmlColumns } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-upload/aer-aggregated-data-upload.constants';
import { aerAggregatedDataUploadFormProvider } from '@requests/common/aer/subtasks/aer-aggregated-data/aer-aggregated-data-upload/aer-aggregated-data-upload.form-provider';
import { AerAggregatedDataXmlService } from '@requests/common/aer/subtasks/aer-aggregated-data/services';
import { TASK_FORM } from '@requests/common/task-form.token';
import { DataParserWizardStepComponent } from '@shared/components';
import { PersistablePaginationService } from '@shared/services';
import { AerAggregatedDataUploadDto, XmlValidationError } from '@shared/types';

@Component({
  selector: 'mrtm-aer-aggregated-data-upload',
  imports: [
    LinkDirective,
    RouterLink,
    DataParserWizardStepComponent,
    ButtonDirective,
    TableComponent,
    WarningTextComponent,
    PageHeadingComponent,
    PendingButtonDirective,
  ],
  standalone: true,
  templateUrl: './aer-aggregated-data-upload.component.html',
  providers: [aerAggregatedDataUploadFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AerAggregatedDataUploadComponent {
  protected readonly formGroup = inject<UntypedFormGroup>(TASK_FORM);
  private readonly persistablePaginationService = inject(PersistablePaginationService);
  private readonly store = inject(RequestTaskStore);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly service = inject(TaskService<AerSubmitTaskPayload>);
  private readonly xmlService = inject(AerAggregatedDataXmlService);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly title = inject(Title);

  private readonly dataParserWizardStep = viewChild.required(DataParserWizardStepComponent);

  taskMap = aerAggregatedDataSubtasksListMap;
  showConfirmation = false;
  columns = aerAggregatedDataUploadTableXmlColumns;
  fileCtrl = this.formGroup.controls.file;
  wizardSteps = AerAggregatedDataWizardStep;
  existingAggregatedData = this.store.select(aerCommonQuery.selectAggregatedDataList);
  readonly xmlErrors: WritableSignal<XmlValidationError[]> = signal([]);
  readonly shipEmissionsList: WritableSignal<AerShipAggregatedDataSave[]> = signal([]);
  readonly aggregatedTableData: Signal<AerAggregatedDataUploadDto[]> = computed(() =>
    this.shipEmissionsList().map((item) => ({
      imoNumber: item.imoNumber,
      name: this.store.select(aerCommonQuery.selectShipNameByImoNumber(item.imoNumber))(),
    })),
  );
  uploadedFile: File;

  async onFileSelect(event: any) {
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(false);
    this.xmlErrors.set([]);
    this.shipEmissionsList.set([]);
    this.uploadedFile = event.target.files[0];
    this.fileCtrl.setValue(this.uploadedFile);

    if (this.fileCtrl.valid) {
      const xmlText = await this.uploadedFile.text();
      const shipsXml = this.xmlService.parse(xmlText);
      this.xmlErrors.set(shipsXml?.errors);
      if (shipsXml?.data?.length) {
        this.shipEmissionsList.set(shipsXml?.data);
      }
    }

    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
    event.target.value = '';
  }

  /**
   * Set custom error when no file is uploaded but submit is clicked
   */
  private setNoFileUploadedError() {
    this.xmlErrors.set([
      {
        row: null,
        column: null,
        message: 'Upload the ships and emission details file',
      },
    ]);
    this.dataParserWizardStep().isSummaryDisplayedSubject.next(true);
  }

  toggleConfirmation(value: boolean) {
    this.showConfirmation = value;
    this.showConfirmation
      ? this.title.setTitle(this.taskMap.uploadAggregatedDataConfirmation.title)
      : this.title.setTitle(this.taskMap.uploadAggregatedData.title);
  }

  onSubmit() {
    if (!this.xmlErrors()?.length && !this.shipEmissionsList()?.length) {
      this.setNoFileUploadedError();
    } else if (this.existingAggregatedData()?.length && !this.showConfirmation && !this.xmlErrors()?.length) {
      this.toggleConfirmation(true);
    } else if (this.shipEmissionsList()?.length) {
      this.persistablePaginationService.reset();
      this.service
        .saveSubtask(
          AER_AGGREGATED_DATA_SUB_TASK,
          AerAggregatedDataWizardStep.UPLOAD_AGGREGATED_DATA,
          this.activatedRoute,
          this.shipEmissionsList(),
        )
        .subscribe(() => {
          const actionMsg = this.showConfirmation ? 'replaced' : 'uploaded';
          this.feedbackBannerStore.setSuccessMessages([`The aggregated data file has been ${actionMsg} successfully`]);
        });
    }
  }
}
