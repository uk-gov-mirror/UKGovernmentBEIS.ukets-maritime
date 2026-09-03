import { inject, Service } from '@angular/core';

import { map, Observable, switchMap, take } from 'rxjs';

import {
  GuidanceDocumentDTO,
  GuidanceDocumentsService,
  GuidanceSectionDTO,
  GuidanceSectionsService,
  SaveGuidanceSectionDTO,
} from '@mrtm/api';

import { BusinessErrorService, catchBadRequest } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';

import { GuidanceStore } from '@guidance/+state';
import { guidanceSectionNameExist } from '@guidance/errors/business-error';
import { ManageGuidanceDocumentDTO } from '@guidance/guidance.types';
import { isNil } from '@shared/utils';

@Service()
export class GuidanceService {
  private readonly guidanceSectionsService = inject(GuidanceSectionsService);
  private readonly guidanceDocumentsService = inject(GuidanceDocumentsService);
  private readonly guidanceStore = inject(GuidanceStore);
  private readonly pendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  public loadGuidanceSections(): Observable<boolean> {
    return this.guidanceSectionsService.getGuidanceSections('body').pipe(
      map(({ guidanceSections, editable }) => {
        this.guidanceStore.setGuidanceSections(guidanceSections);
        this.guidanceStore.setIsEditable(editable);
        return true;
      }),
    );
  }

  public upsertSection(section: SaveGuidanceSectionDTO & { id?: number }): Observable<any> {
    const sectionId = section.id;
    const sectionDto = section;
    delete sectionDto.id;

    return (
      isNil(sectionId)
        ? this.guidanceSectionsService.createGuidanceSection(sectionDto)
        : this.guidanceSectionsService
            .updateGuidanceSection(sectionId, sectionDto)
            .pipe(map((sectionResponse) => sectionResponse.id))
    ).pipe(
      take(1),
      this.pendingRequestService.trackRequest(),
      catchBadRequest('GUIDANCE1001', () => this.businessErrorService.showError(guidanceSectionNameExist())),
      switchMap(() => this.loadGuidanceSections()),
    );
  }

  public deleteSection(sectionId: GuidanceSectionDTO['id']): Observable<any> {
    return this.guidanceSectionsService.deleteGuidanceSection(sectionId).pipe(
      take(1),
      this.pendingRequestService.trackRequest(),
      switchMap(() => this.loadGuidanceSections()),
    );
  }

  public upsertDocument(document: ManageGuidanceDocumentDTO & { id?: number }): Observable<any> {
    const { id: documentId, sectionId } = document;
    const documentDto = { ...document, file: document?.file?.uuid };
    delete documentDto.id;
    delete documentDto.sectionId;

    return (
      isNil(documentId)
        ? this.guidanceDocumentsService.createGuidanceDocument(sectionId, documentDto)
        : this.guidanceDocumentsService
            .updateGuidanceDocument(documentId, sectionId, documentDto)
            .pipe(map((documentResponse) => documentResponse.id))
    ).pipe(
      take(1),
      this.pendingRequestService.trackRequest(),
      catchBadRequest('GUIDANCE1001', () => this.businessErrorService.showError(guidanceSectionNameExist())),
      switchMap(() => this.loadGuidanceSections()),
    );
  }

  public deleteDocument(documentId: GuidanceDocumentDTO['id'], sectionId: GuidanceSectionDTO['id']): Observable<any> {
    return this.guidanceDocumentsService.deleteGuidanceDocument(documentId, sectionId).pipe(
      take(1),
      this.pendingRequestService.trackRequest(),
      switchMap(() => this.loadGuidanceSections()),
    );
  }
}
