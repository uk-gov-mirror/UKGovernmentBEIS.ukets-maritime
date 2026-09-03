import { Service } from '@angular/core';

import { produce } from 'immer';

import { VerificationBodyNameInfoDTO } from '@mrtm/api';

import { SignalStore } from '@netz/common/store';

import {
  initialSendReportSuccessState,
  SendReportSuccessState,
} from '@requests/tasks/aer-submit/subtasks/send-report/send-report-success-message/+state/send-report-success.state';

@Service()
export class SendReportSuccessStore extends SignalStore<SendReportSuccessState> {
  constructor() {
    super(initialSendReportSuccessState);
  }

  setVerificationBodyNameInfo(verificationBodyNameInfo: VerificationBodyNameInfoDTO) {
    this.setState(
      produce(this.state, (state) => {
        state.verificationBodyNameInfo = verificationBodyNameInfo;
      }),
    );
  }
}
