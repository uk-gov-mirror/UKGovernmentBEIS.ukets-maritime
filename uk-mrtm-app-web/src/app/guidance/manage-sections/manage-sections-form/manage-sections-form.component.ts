import { ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RegulatorCurrentUserDTO, SaveGuidanceSectionDTO } from '@mrtm/api';

import { AuthStore, selectUser } from '@netz/common/auth';
import { GovukSelectOption, LinkDirective, SelectComponent, TextInputComponent } from '@netz/govuk-components';

import { guidanceQuery, GuidanceStore } from '@guidance/+state';
import { MANAGE_GUIDANCE_FORM } from '@guidance/guidance.constants';
import { manageSectionsFormProvider } from '@guidance/manage-sections/manage-sections-form/manage-sections-form.provider';
import { ManageSectionsFormGroupModel } from '@guidance/manage-sections/manage-sections-form/manage-sections-form.types';
import { WizardStepComponent } from '@shared/components';
import { isNil } from '@shared/utils';

@Component({
  selector: 'mrtm-manage-sections-form',
  imports: [WizardStepComponent, TextInputComponent, ReactiveFormsModule, LinkDirective, RouterLink, SelectComponent],
  standalone: true,
  templateUrl: './manage-sections-form.component.html',
  providers: [manageSectionsFormProvider],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageSectionsFormComponent implements OnInit {
  private readonly guidanceStore = inject(GuidanceStore);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);

  readonly formGroup = inject<ManageSectionsFormGroupModel>(MANAGE_GUIDANCE_FORM);
  readonly manageType = this.guidanceStore.select(guidanceQuery.selectManageGuidanceType);
  readonly displayOrderSelectItems: Signal<Array<GovukSelectOption>> = computed(() => {
    const competentAuthority = (this.authStore.select(selectUser)() as RegulatorCurrentUserDTO)?.competentAuthority;
    const manageType = this.guidanceStore.select(guidanceQuery.selectManageGuidanceType)();
    return [
      ...Array(
        this.guidanceStore.select(guidanceQuery.selectSectionsForCompetentAuthority(competentAuthority))()?.length +
          (manageType === 'CREATE' ? 1 : 0),
      ).keys(),
    ].map((item) => ({ value: item + 1, text: `${item + 1}` }));
  });

  ngOnInit(): void {
    const displayOrderNoCtrl = this.formGroup.get('displayOrderNo');
    if (isNil(displayOrderNoCtrl.value)) {
      displayOrderNoCtrl.setValue(this.displayOrderSelectItems().at(-1).value);
    }
  }

  onSubmit(): void {
    this.guidanceStore.updateManageGuidance({
      ...this.guidanceStore.select(guidanceQuery.selectManageGuidance)(),
      object: this.formGroup.value as SaveGuidanceSectionDTO,
    });

    this.router.navigate(['summary'], { relativeTo: this.activatedRoute });
  }
}
