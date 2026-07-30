import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { lastValueFrom, of } from 'rxjs';

import { DocumentTemplatesService } from '@mrtm/api';

import { ActivatedRouteSnapshotStub, mockClass, MockType } from '@netz/common/testing';

import { DocumentTemplateGuard } from '@templates/document/document-template.guard';
import { mockedDocumentTemplate } from '@templates/testing/templates-data.mock';

describe('DocumentTemplateGuard', () => {
  let guard: DocumentTemplateGuard;
  let documentTemplatesService: MockType<DocumentTemplatesService>;

  beforeEach(() => {
    documentTemplatesService = mockClass(DocumentTemplatesService);
    documentTemplatesService.getDocumentTemplateById.mockReturnValueOnce(of(mockedDocumentTemplate) as any);

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        DocumentTemplateGuard,
        { provide: DocumentTemplatesService, useValue: documentTemplatesService },
      ],
    });
    guard = TestBed.inject(DocumentTemplateGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  it('should return email template', async () => {
    await expect(
      lastValueFrom(guard.canActivate(new ActivatedRouteSnapshotStub({ templateId: mockedDocumentTemplate.id }))),
    ).resolves.toBeTruthy();

    expect(documentTemplatesService.getDocumentTemplateById).toHaveBeenCalledWith(mockedDocumentTemplate.id);

    await expect(guard.resolve()).toEqual(mockedDocumentTemplate);
  });
});
