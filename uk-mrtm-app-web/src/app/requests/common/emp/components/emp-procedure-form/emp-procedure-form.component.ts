import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TextareaComponent, TextInputComponent } from '@netz/govuk-components';

import { existingControlContainer } from '@shared/providers';

@Component({
  selector: 'mrtm-emp-procedure-form',
  imports: [TextareaComponent, ReactiveFormsModule, TextInputComponent],
  standalone: true,
  templateUrl: './emp-procedure-form.component.html',
  viewProviders: [existingControlContainer],
})
export class EmpProcedureFormComponent {}
