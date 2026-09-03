import { Component, input } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

import { TextInputComponent } from '@netz/govuk-components';

import { PhoneInputComponent } from '@shared/components';
import { existingControlContainer } from '@shared/providers';

@Component({
  selector: 'mrtm-user-input',
  imports: [TextInputComponent, ReactiveFormsModule, PhoneInputComponent],
  standalone: true,
  templateUrl: './user-input.component.html',
  styles: `
    .break-line {
      white-space: pre-line;
    }
  `,
  viewProviders: [existingControlContainer],
})
export class UserInputComponent {
  readonly hasJobTitle = input(true);
  readonly phoneType = input<'full' | 'national'>();
  readonly isNotification = input(false);
  readonly emailHint = `All system alerts, notices, and official communications will be sent by email
  Contact your regulator if you require a specific notice to be sent by post.`;
}
