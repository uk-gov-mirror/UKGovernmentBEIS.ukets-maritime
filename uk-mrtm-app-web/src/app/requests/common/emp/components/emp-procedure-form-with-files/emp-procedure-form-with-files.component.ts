import { Component, inject } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { RequestTaskStore } from '@netz/common/store';

import { empCommonQuery } from '@requests/common/emp/+state';
import { EmpProcedureFormComponent } from '@requests/common/emp/components/emp-procedure-form';
import { MultipleFileInputComponent } from '@shared/components';
import { existingControlContainer } from '@shared/providers';

@Component({
  selector: 'mrtm-emp-procedure-form-with-files',
  imports: [EmpProcedureFormComponent, MultipleFileInputComponent, ReactiveFormsModule],
  standalone: true,
  templateUrl: './emp-procedure-form-with-files.component.html',
  viewProviders: [existingControlContainer],
})
export class EmpProcedureFormWithFilesComponent {
  private readonly store: RequestTaskStore = inject(RequestTaskStore);
  downloadUrl = this.store.select(empCommonQuery.selectTasksDownloadUrl)();
}
