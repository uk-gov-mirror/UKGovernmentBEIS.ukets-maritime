import { HttpResponse } from '@angular/common/http';
import { inject, Service } from '@angular/core';

import { map, Observable, switchMap, tap } from 'rxjs';

import {
  VerificationBodiesService,
  VerificationBodyCreationDTO,
  VerificationBodyDTO,
  VerificationBodyInfoDTO,
  VerificationBodyUpdateDTO,
  VerificationBodyUpdateStatusDTO,
  VerifierAuthoritiesService,
  VerifierAuthorityUpdateDTO,
} from '@mrtm/api';

import { BusinessErrorService, catchElseRethrow, HttpStatuses } from '@netz/common/error';
import { PendingRequestService } from '@netz/common/services';

import { Store } from '@core/store';
import { SubmissionError } from '@shared/types';
import { isNil } from '@shared/utils';
import {
  initialVerificationBodiesState,
  initialVerificationBodiesUpdateState,
  initialVerificationBodyCreationState,
  VerificationBodiesState,
} from '@verification-bodies/+state/verification-bodies.state';
import { viewNotFoundVerificationBodyError } from '@verification-bodies/errors/business-error';
import { EmissionTradingSchemesEnum } from '@verification-bodies/types';

@Service()
export class VerificationBodiesStoreService extends Store<VerificationBodiesState> {
  private readonly verificationBodyService: VerificationBodiesService = inject(VerificationBodiesService);
  private readonly verifierAuthoritiesService: VerifierAuthoritiesService = inject(VerifierAuthoritiesService);
  private readonly pendingRequestService: PendingRequestService = inject(PendingRequestService);
  private readonly businessErrorService = inject(BusinessErrorService);

  constructor() {
    super(initialVerificationBodiesState);
  }

  public setIsSubmitted(isSubmitted: boolean = true): void {
    const state = this.getState();
    this.setState({
      ...state,
      createVerificationBody: {
        ...state.createVerificationBody,
        isSubmitted,
      },
    });
  }

  public resetCreateVerificationBody(): void {
    this.setState({
      ...this.getState(),
      createVerificationBody: initialVerificationBodyCreationState,
    });
  }

  public setNewVerificationBody(
    verificationBodyDTO: VerificationBodyCreationDTO,
    initiallySubmitted: boolean | undefined = true,
  ): void {
    const state = this.getState();

    this.setState({
      ...state,
      createVerificationBody: {
        ...state.createVerificationBody,
        newVerificationBody: verificationBodyDTO,
        isInitiallySubmitted: isNil(initiallySubmitted)
          ? state.createVerificationBody.isInitiallySubmitted
          : initiallySubmitted,
      },
    });
  }

  public setSubmissionErrors(submissionErrors: SubmissionError[] | null): void {
    const state = this.getState();
    this.setState({
      ...state,
      createVerificationBody: {
        ...state.createVerificationBody,
        submissionErrors,
      },
    });
  }

  public createVerificationBody(): Observable<HttpResponse<VerificationBodyInfoDTO>> {
    return this.verificationBodyService
      .createVerificationBody(
        {
          ...this.getState().createVerificationBody.newVerificationBody,
          // IT IS CONST VALUE FOR MRTM
          emissionTradingSchemes: [EmissionTradingSchemesEnum.UKMRTM],
        },
        'response',
      )
      .pipe(this.pendingRequestService.trackRequest());
  }

  public loadVerificationBodies(): Observable<boolean> {
    return this.verificationBodyService.getVerificationBodies().pipe(
      map(({ verificationBodies, editable }) => {
        this.setState({
          ...this.getState(),
          verificationBodiesList: {
            items: verificationBodies,
            editable,
          },
        });

        return true;
      }),
    );
  }

  public loadVerificationBody(id: VerificationBodyDTO['id']): Observable<boolean> {
    return this.verificationBodyService.getVerificationBodyById(id).pipe(
      map((res) => {
        this.setState({
          ...this.getState(),
          currentVerificationBody: {
            ...initialVerificationBodiesUpdateState,
            verificationBody: res,
          },
        });
        return true;
      }),
      catchElseRethrow(
        (res) => res.status === HttpStatuses.NotFound,
        () => this.businessErrorService.showError(viewNotFoundVerificationBodyError),
      ),
    );
  }

  public updateVerificationBodiesStatuses(verificationBodies: VerificationBodyUpdateStatusDTO[]): Observable<void> {
    return this.verificationBodyService
      .updateVerificationBodiesStatus(verificationBodies)
      .pipe(this.pendingRequestService.trackRequest());
  }

  public updateVerificationBodyDetails(verificationBody: VerificationBodyUpdateDTO): Observable<void> {
    return this.verificationBodyService
      .updateVerificationBody({
        ...verificationBody,
        emissionTradingSchemes: [EmissionTradingSchemesEnum.UKMRTM],
      })
      .pipe(
        tap(() => {
          this.setState({
            ...this.getState(),
            currentVerificationBody: {
              verificationBody: verificationBody,
              isSubmitted: true,
              submissionErrors: [],
            },
          });
        }),
      );
  }

  public setUpdateVerificationBodyIsSubmitted(isSubmitted: boolean): void {
    const state = this.getState();
    this.setState({
      ...state,
      currentVerificationBody: {
        ...state.currentVerificationBody,
        isSubmitted,
      },
    });
  }

  public deleteVerificationBody(id: VerificationBodyDTO['id']): Observable<void> {
    return this.verificationBodyService.deleteVerificationBodyById(id).pipe(this.pendingRequestService.trackRequest());
  }

  public loadVerifierUsers(verificationBodyId: number): Observable<boolean> {
    return this.verifierAuthoritiesService.getVerifierAuthoritiesByVerificationBodyId(verificationBodyId).pipe(
      map(({ authorities, editable }) => {
        this.setState({
          ...this.getState(),
          verificationBodyContacts: {
            items: authorities,
            editable,
          },
        });
        return true;
      }),
    );
  }

  public updateVerifierUsersStatuses(
    verificationBodyId: number,
    authorities: VerifierAuthorityUpdateDTO[],
  ): Observable<boolean> {
    return this.verifierAuthoritiesService
      .updateVerifierAuthoritiesByVerificationBodyId(verificationBodyId, authorities)
      .pipe(
        this.pendingRequestService.trackRequest(),
        switchMap(() => this.loadVerifierUsers(verificationBodyId)),
      );
  }

  public deleteVerifierUser(userId: string) {
    return this.verifierAuthoritiesService
      .deleteVerifierAuthority(userId)
      .pipe(this.pendingRequestService.trackRequest());
  }
}
