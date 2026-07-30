import { MrtmRequestType } from '@shared/types';

export interface WorkflowLabel {
  title: string;
  button: string;
  routerLink?: string | string[];
  type: MrtmRequestType;
  errors: string[];
}

export type WorkflowMap = Record<MrtmRequestType, Partial<WorkflowLabel>>;
