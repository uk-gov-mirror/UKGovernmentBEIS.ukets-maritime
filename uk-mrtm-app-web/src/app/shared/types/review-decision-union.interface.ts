import {
  AerDataReviewDecision,
  EmpIssuanceReviewDecision,
  EmpVariationReviewDecision,
  ReviewDecisionRequiredChange,
} from '@mrtm/api';

import { AttachedFile } from '@shared/types/attached-file.interface';

interface ReviewDecisionUnionBase<TType, TDetails> {
  type: TType;
  details: TDetails;
}

interface ReviewDecisionDetails {
  notes?: string;
  requiredChanges: Array<ReviewDecisionRequiredChange>;
}

interface EmpVariationReviewDecisionDetails extends ReviewDecisionDetails {
  variationScheduleItems: Array<string>;
}

export type ReviewDecisionType = AerDataReviewDecision['type'] | EmpIssuanceReviewDecision['type'];

export type ReviewDecisionUnion = ReviewDecisionUnionBase<ReviewDecisionType, ReviewDecisionDetails>;

export type EmpVariationReviewDecisionUnion = ReviewDecisionUnionBase<
  EmpVariationReviewDecision['type'],
  EmpVariationReviewDecisionDetails
>;

interface ReviewDecisionDtoBase<T> {
  type?: T;
  details?: {
    requiredChanges: {
      reason?: string;
      files?: AttachedFile[];
    }[];
    variationScheduleItems?: Array<string>;
    notes?: string;
    summary?: string;
  };
}

export type ReviewDecisionDto = ReviewDecisionDtoBase<ReviewDecisionType>;

export type EmpVariationReviewDecisionDto = ReviewDecisionDtoBase<EmpVariationReviewDecision['type']>;
