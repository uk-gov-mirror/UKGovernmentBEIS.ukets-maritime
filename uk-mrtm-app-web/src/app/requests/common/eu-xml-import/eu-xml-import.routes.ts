import { Routes } from '@angular/router';

import { canActivateEuXmlImport } from '@requests/common/eu-xml-import/eu-xml-import.guard';

export const EU_XML_IMPORT_ROUTES: Routes = [
  {
    path: '',
    title: 'Import EU XML if you have a single ship',
    data: { breadcrumb: false, backlink: '../' },
    canActivate: [canActivateEuXmlImport],
    loadComponent: () =>
      import('@requests/common/eu-xml-import/eu-xml-import-process').then((m) => m.EuXmlImportProcessComponent),
  },
];
