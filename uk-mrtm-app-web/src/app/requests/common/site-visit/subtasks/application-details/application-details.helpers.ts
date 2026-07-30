import { SiteVisit } from '@mrtm/api';

export const APPLICATION_DETAILS_SUBTASK: keyof SiteVisit = 'applicationDetails';
export const APPLICATION_DETAILS_ROUTE_PATH = 'application-details';

export enum ApplicationDetailsWizardSteps {
  EVIDENCE = 'evidence',
  SUMMARY = '../',
  DECISION = 'decision',
}

export const isWizardCompleted = (siteVisit: SiteVisit): boolean => !!siteVisit?.applicationDetails?.files?.length;
