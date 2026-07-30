import { InjectionToken, Provider } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

import { SiteVisitRequestCreateActionPayload } from '@mrtm/api';

import { GovukValidators } from '@netz/govuk-components';

import { SiteVisitFormGroupModel } from '@accounts/containers/actions/site-visit-entry-point/site-visit-entry-point.types';

export const SITE_VISIT_ENTRY_POINT_FORM = new InjectionToken<FormGroup<SiteVisitFormGroupModel>>(
  'siteVisitEntryPointForm',
);

export const siteVisitEntryPointFormProvider: Provider = {
  provide: SITE_VISIT_ENTRY_POINT_FORM,
  deps: [FormBuilder],
  useFactory: (formBuilder: FormBuilder): FormGroup<SiteVisitFormGroupModel> =>
    formBuilder.group({
      payloadType: formBuilder.control<SiteVisitRequestCreateActionPayload['payloadType'] | null>(
        'SITE_VISIT_REQUEST_CREATE_ACTION_PAYLOAD',
      ),
      year: formBuilder.control<SiteVisitRequestCreateActionPayload['year'] | null>(null, {
        validators: [GovukValidators.required('Select the reporting year for the virtual site visit')],
      }),
    }),
};
