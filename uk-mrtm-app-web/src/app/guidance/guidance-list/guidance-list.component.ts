import { ChangeDetectionStrategy, Component, computed, effect, inject, Signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { GuidanceSectionDTO } from '@mrtm/api';

import { FeedbackBannerComponent, FeedbackBannerStore } from '@netz/common/components';
import { GovukSelectOption, LinkDirective, SelectComponent } from '@netz/govuk-components';

import { guidanceQuery, GuidanceStore } from '@guidance/+state';
import { DropdownButtonGroupComponent, DropdownButtonItemComponent } from '@shared/components/dropdown-button-group';
import { CompetentAuthorityPipe } from '@shared/pipes';

@Component({
  selector: 'mrtm-guidance-list',
  imports: [
    DropdownButtonGroupComponent,
    DropdownButtonItemComponent,
    RouterLink,
    LinkDirective,
    SelectComponent,
    ReactiveFormsModule,
    CompetentAuthorityPipe,
    FeedbackBannerComponent,
  ],
  standalone: true,
  templateUrl: './guidance-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuidanceListComponent {
  private readonly router = inject(Router);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly store = inject(GuidanceStore);
  private readonly feedbackBannerStore = inject(FeedbackBannerStore);
  private readonly competentAuthorityPipe = new CompetentAuthorityPipe();
  private readonly availableCompetentAuthorities = this.store.select(guidanceQuery.selectAvailableCompetentAuthorities);
  private readonly formGroup = new UntypedFormGroup({});

  readonly filtersFormGroup = new UntypedFormGroup({
    selectedCa: new UntypedFormControl(),
  });
  readonly filterCaSelectOptions: Signal<Array<GovukSelectOption<GuidanceSectionDTO['competentAuthority']>>> = computed(
    () =>
      this.availableCompetentAuthorities().map((ca) => ({
        value: ca,
        text: this.competentAuthorityPipe.transform(ca),
      })),
  );
  readonly selectedCompetentAuthority = toSignal(this.filtersFormGroup.get('selectedCa').valueChanges);
  readonly expandedSections = new Set<GuidanceSectionDTO['id']>();
  readonly isEditable = this.store.select(guidanceQuery.selectIsEditable);
  readonly sections = computed(() => {
    const ca = this.selectedCompetentAuthority();
    const sections = this.store.select(guidanceQuery.selectSectionsForCompetentAuthority(ca))();
    const isEditable = this.isEditable();
    return sections
      .filter((section) => (!isEditable ? section.guidanceDocuments?.length > 0 : true))
      .map((section) => ({
        ...section,
        guidanceDocuments: [...section.guidanceDocuments].sort(
          (a, b) => a.displayOrderNo - b.displayOrderNo || b.title.localeCompare(a.title),
        ),
      }))
      .sort((a, b) => a.displayOrderNo - b.displayOrderNo);
  });

  onToggleSection(sectionId: GuidanceSectionDTO['id']): void {
    if (this.expandedSections.has(sectionId)) {
      this.expandedSections.delete(sectionId);
    } else {
      this.expandedSections.add(sectionId);
    }
  }

  constructor() {
    effect(() => {
      const availableCompetentAuthorities = this.availableCompetentAuthorities();
      this.filtersFormGroup.setValue({
        selectedCa:
          (availableCompetentAuthorities.includes('ENGLAND') ? 'ENGLAND' : availableCompetentAuthorities.pop()) ?? null,
      });
    });
  }

  onManageFiles(): void {
    this.formGroup.setErrors(null);
    if (!this.sections().length) {
      this.formGroup.setErrors({
        noSections: 'No files have been uploaded. Add a section to upload and manage files',
      });
      this.feedbackBannerStore.setInvalidForm(this.formGroup);
      return;
    }

    this.router.navigate(['./manage/documents'], { relativeTo: this.activatedRoute });
  }
}
