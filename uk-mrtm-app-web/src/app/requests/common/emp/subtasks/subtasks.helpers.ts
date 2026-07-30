import { EmpProcedureForm } from '@mrtm/api';

export const empProcedureFormCompleted = (empProcedureForm: EmpProcedureForm) =>
  !!empProcedureForm?.reference &&
  !!empProcedureForm?.description &&
  !!empProcedureForm?.responsiblePersonOrPosition &&
  !!empProcedureForm?.recordsLocation;
