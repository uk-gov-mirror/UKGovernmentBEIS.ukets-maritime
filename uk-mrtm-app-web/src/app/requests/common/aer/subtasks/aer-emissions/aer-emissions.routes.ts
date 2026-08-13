import { ActivatedRouteSnapshot, Routes } from '@angular/router';

import {
  canActivateAerEmissionsShipEdit,
  canActivateAerEmissionsShipSummary,
  canActivateAerEmissionsSummary,
} from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.guard';
import { AerEmissionsWizardStep } from '@requests/common/aer/subtasks/aer-emissions/aer-emissions.helpers';
import { aerEmissionsBacklinkResolver } from '@requests/common/aer/subtasks/aer-emissions/aer-emissions-backlink.resolver';
import { aerEmissionsMap, aerEmissionsShipMap } from '@requests/common/aer/subtasks/aer-subtasks-list.map';
import { emissionsShipSubtaskMap } from '@requests/common/components/emissions';
import { deleteShipsGuard } from '@requests/common/components/emissions/delete-ships/';
import { backlinkResolver } from '@requests/common/task-navigation';

export const AER_EMISSIONS_ROUTES: Routes = [
  {
    path: '',
    title: aerEmissionsMap.title,
    data: { breadcrumb: false, backlink: '../../' },
    canActivate: [canActivateAerEmissionsSummary],
    loadComponent: () =>
      import('@requests/common/aer/subtasks/aer-emissions/aer-emissions-summary').then(
        (c) => c.AerEmissionsSummaryComponent,
      ),
  },
  {
    path: AerEmissionsWizardStep.LIST_OF_SHIPS,
    title: aerEmissionsMap.ships.title,
    data: { breadcrumb: false },
    resolve: { backlink: backlinkResolver(AerEmissionsWizardStep.SUMMARY, '../../') },
    loadComponent: () =>
      import('@requests/common/aer/subtasks/aer-emissions/aer-list-of-ships').then((c) => c.AerListOfShipsComponent),
  },
  {
    path: AerEmissionsWizardStep.UPLOAD_SHIPS,
    title: aerEmissionsMap.uploadShips.title,
    data: { backlink: `../${AerEmissionsWizardStep.LIST_OF_SHIPS}`, breadcrumb: false },
    loadComponent: () =>
      import('@requests/common/components/emissions/upload-ships').then((c) => c.UploadShipsComponent),
  },
  {
    path: AerEmissionsWizardStep.FETCH_FROM_EMP,
    title: aerEmissionsMap.fetchFromEMP.title,
    data: { backlink: `../${AerEmissionsWizardStep.LIST_OF_SHIPS}`, breadcrumb: false },
    loadComponent: () =>
      import('@requests/common/aer/subtasks/aer-emissions/aer-fetch-ships-from-emp').then(
        (c) => c.AerFetchShipsFromEmpComponent,
      ),
  },
  {
    path: AerEmissionsWizardStep.DELETE_SHIPS,
    title: 'Delete the selected ships',
    resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.DELETE_SHIPS) },
    data: { breadcrumb: false },
    canActivate: [deleteShipsGuard],
    loadComponent: () =>
      import('@requests/common/components/emissions/delete-ships').then((c) => c.DeleteShipsComponent),
  },
  {
    path: 'ships/:shipId',
    data: { breadcrumb: false },
    children: [
      {
        path: '',
        title: 'Check your answers',
        data: { breadcrumb: false },
        canActivate: [canActivateAerEmissionsShipSummary],
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.SHIP_SUMMARY) },
        loadComponent: () =>
          import('@requests/common/aer/subtasks/aer-emissions/aer-ship-summary').then((c) => c.AerShipSummaryComponent),
      },
      {
        path: AerEmissionsWizardStep.BASIC_DETAILS,
        title: emissionsShipSubtaskMap.details.title,
        data: { breadcrumb: false },
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.BASIC_DETAILS) },
        canActivate: [canActivateAerEmissionsShipEdit()],
        loadComponent: () =>
          import('@requests/common/components/emissions/basic-ship-details').then((c) => c.BasicShipDetailsComponent),
      },
      {
        path: AerEmissionsWizardStep.FUELS_AND_EMISSIONS_LIST,
        title: emissionsShipSubtaskMap.fuelsAndEmissionsFactors.title,
        data: { breadcrumb: false },
        canActivate: [canActivateAerEmissionsShipEdit('../../')],
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.FUELS_AND_EMISSIONS_LIST) },
        loadComponent: () =>
          import('@requests/common/aer/subtasks/aer-emissions/aer-fuels-and-emissions-factors-list').then(
            (c) => c.AerFuelsAndEmissionsFactorsListComponent,
          ),
      },
      {
        path: `${AerEmissionsWizardStep.FUELS_AND_EMISSIONS_FORM}/:factoryId`,
        title: (route: ActivatedRouteSnapshot) =>
          route.queryParamMap.get('change') === 'true' && !route.queryParamMap.has('create')
            ? emissionsShipSubtaskMap.fuelsAndEmissionsFactorsFormEdit.title
            : emissionsShipSubtaskMap.fuelsAndEmissionsFactorsFormAdd.title,
        data: { breadcrumb: false },
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.FUELS_AND_EMISSIONS_FORM) },
        canActivate: [canActivateAerEmissionsShipEdit()],
        loadComponent: () =>
          import('@requests/common/components/emissions/fuels-and-emissions-factors-form').then(
            (c) => c.FuelsAndEmissionsFactorsFormComponent,
          ),
      },
      {
        path: AerEmissionsWizardStep.EMISSION_SOURCES_LIST,
        title: emissionsShipSubtaskMap.emissionsSources.title,
        data: { breadcrumb: false },
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.EMISSION_SOURCES_LIST) },
        canActivate: [canActivateAerEmissionsShipEdit('../../')],
        loadComponent: () =>
          import('@requests/common/aer/subtasks/aer-emissions/aer-emission-sources-and-fuel-types-used-list').then(
            (c) => c.AerEmissionSourcesAndFuelTypesUsedListComponent,
          ),
      },
      {
        path: `${AerEmissionsWizardStep.EMISSION_SOURCES_FORM}/:sourceId`,
        title: (route: ActivatedRouteSnapshot) =>
          route.queryParamMap.get('change') === 'true'
            ? emissionsShipSubtaskMap.emissionsSourcesFormEdit.title
            : emissionsShipSubtaskMap.emissionsSourcesFormAdd.title,
        data: { breadcrumb: false },
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.EMISSION_SOURCES_FORM) },
        canActivate: [canActivateAerEmissionsShipEdit()],
        loadComponent: () =>
          import('@requests/common/components/emissions/emission-sources-and-fuel-types-used-form').then(
            (c) => c.EmissionSourcesAndFuelTypesUsedFormComponent,
          ),
      },
      {
        path: AerEmissionsWizardStep.UNCERTAINTY_LEVEL,
        title: emissionsShipSubtaskMap.uncertaintyLevel.title,
        data: { breadcrumb: false },
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.UNCERTAINTY_LEVEL) },
        canActivate: [canActivateAerEmissionsShipEdit()],
        loadComponent: () =>
          import('@requests/common/components/emissions/uncertainty-level').then((c) => c.UncertaintyLevelComponent),
      },
      {
        path: AerEmissionsWizardStep.DEROGATIONS,
        title: aerEmissionsShipMap.derogations.title,
        data: { breadcrumb: false },
        resolve: { backlink: aerEmissionsBacklinkResolver(AerEmissionsWizardStep.DEROGATIONS) },
        canActivate: [canActivateAerEmissionsShipEdit()],
        loadComponent: () =>
          import('@requests/common/aer/subtasks/aer-emissions/aer-derogations').then((c) => c.AerDerogationsComponent),
      },
    ],
  },
];
