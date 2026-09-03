import { inject, Service } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Resolve } from '@angular/router';

import { map, Observable, tap } from 'rxjs';

import { DocumentTemplateDTO, DocumentTemplatesService } from '@mrtm/api';

@Service()
export class DocumentTemplateGuard implements CanActivate, Resolve<DocumentTemplateDTO> {
  private readonly documentTemplatesService = inject(DocumentTemplatesService);

  documentTemplate: DocumentTemplateDTO;

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    return this.documentTemplatesService.getDocumentTemplateById(Number(route.paramMap.get('templateId'))).pipe(
      tap((documentTemplate) => (this.documentTemplate = documentTemplate)),
      map((documentTemplate) => !!documentTemplate),
    );
  }

  resolve(): DocumentTemplateDTO {
    return this.documentTemplate;
  }
}
