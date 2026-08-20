import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';

import { firstValueFrom, of, throwError } from 'rxjs';

import { TasksService } from '@mrtm/api';

import { BusinessErrorService } from '@netz/common/error';
import { mockRequestTask } from '@netz/common/request-task';
import { PendingRequestService } from '@netz/common/services';
import { RequestTaskStore } from '@netz/common/store';
import { mockClass } from '@netz/common/testing';

import { EuXmlImportData } from '@requests/common/eu-xml-import/eu-xml-import.types';
import { EuXmlImportSaveService } from '@requests/common/eu-xml-import/eu-xml-import-save.service';
import { mapAbbreviations } from '@requests/common/eu-xml-import/mappers/abbreviations.mapper';
import { mapControlActivities } from '@requests/common/eu-xml-import/mappers/control-activities.mapper';
import { mapDataGaps } from '@requests/common/eu-xml-import/mappers/data-gaps.mapper';
import { mapEmissionSources } from '@requests/common/eu-xml-import/mappers/emission-sources.mapper';
import { mapGreenhouseGas } from '@requests/common/eu-xml-import/mappers/greenhouse-gas.mapper';
import { mapManagementProcedures } from '@requests/common/eu-xml-import/mappers/management-procedures.mapper';
import { mapMandate } from '@requests/common/eu-xml-import/mappers/mandate.mapper';
import { mapShipEmissions } from '@requests/common/eu-xml-import/mappers/ships.mapper';

const buildImportData = (): EuXmlImportData => {
  const plan = { '@_shipImoNumber': '1234567', ship: { name: 'MV Test', shipType: 'BULK', grossTonnage: 50000 } };

  return {
    shipEmissions: [mapShipEmissions(plan, 'MV Test').ship],
    emissionSources: mapEmissionSources(plan).emissionSources,
    controlActivities: mapControlActivities(plan).controlActivities,
    abbreviations: mapAbbreviations(plan).abbreviations,
    managementProcedures: mapManagementProcedures(plan).managementProcedures,
    dataGaps: mapDataGaps(plan).dataGaps,
    greenhouseGas: mapGreenhouseGas(plan).greenhouseGas,
    mandate: mapMandate([plan]).mandate,
  };
};

describe('EuXmlImportSaveService', () => {
  let service: EuXmlImportSaveService;
  let store: RequestTaskStore;
  let tasksService: ReturnType<typeof mockClass<TasksService>>;
  let businessErrorService: ReturnType<typeof mockClass<BusinessErrorService>>;

  const setPayload = (payload: unknown = { payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD' }) => {
    store.setState({
      ...mockRequestTask,
      requestTaskItem: {
        ...mockRequestTask.requestTaskItem,
        requestTask: {
          ...mockRequestTask.requestTaskItem.requestTask,
          type: 'EMP_ISSUANCE_APPLICATION_SUBMIT',
          payload,
        },
      },
    });
  };

  beforeEach(() => {
    tasksService = mockClass(TasksService);
    businessErrorService = mockClass(BusinessErrorService);

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: TasksService, useValue: tasksService },
        { provide: BusinessErrorService, useValue: businessErrorService },
        PendingRequestService,
      ],
    });

    service = TestBed.inject(EuXmlImportSaveService);
    store = TestBed.inject(RequestTaskStore);
    setPayload();
  });

  describe('isSupportedTaskType', () => {
    it('is true for EMP_ISSUANCE_APPLICATION_SUBMIT', () => {
      expect(service.isSupportedTaskType).toBe(true);
    });

    it('is false for any other task type', () => {
      store.setState({
        ...mockRequestTask,
        requestTaskItem: {
          ...mockRequestTask.requestTaskItem,
          requestTask: { ...mockRequestTask.requestTaskItem.requestTask, type: 'EMP_ISSUANCE_APPLICATION_REVIEW' },
        },
      });

      expect(service.isSupportedTaskType).toBe(false);
    });
  });

  describe('save', () => {
    it('builds a save action merging every imported section and marks subtasks completed only when their imported data is valid', async () => {
      tasksService.processRequestTaskAction.mockReturnValue(of(undefined));
      const importData = buildImportData();

      await firstValueFrom(service.save(importData));

      expect(tasksService.processRequestTaskAction).toHaveBeenCalledWith({
        requestTaskId: mockRequestTask.requestTaskItem.requestTask.id,
        requestTaskActionType: 'EMP_ISSUANCE_SAVE_APPLICATION',
        requestTaskActionPayload: {
          payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD',
          emissionsMonitoringPlan: {
            emissions: { ships: importData.shipEmissions },
            sources: importData.emissionSources,
            controlActivities: importData.controlActivities,
            abbreviations: importData.abbreviations,
            managementProcedures: importData.managementProcedures,
            dataGaps: importData.dataGaps,
            greenhouseGas: importData.greenhouseGas,
            mandate: importData.mandate,
          },
          empSectionsCompleted: {
            emissions: 'IN_PROGRESS',
            sources: 'IN_PROGRESS',
            controlActivities: 'IN_PROGRESS',
            // the minimal fixture has no abbreviations, so `exist: false` is already complete
            abbreviations: 'COMPLETED',
            managementProcedures: 'IN_PROGRESS',
            dataGaps: 'IN_PROGRESS',
            greenhouseGas: 'IN_PROGRESS',
            // the minimal fixture has no ISM company, so `exist: false` is already complete
            mandate: 'COMPLETED',
            [`emissions-ship-${importData.shipEmissions[0].uniqueIdentifier}`]: 'IN_PROGRESS',
          },
        },
      });
    });

    it('leaves the existing operator details untouched, since the import process must not modify that subtask', async () => {
      const existingOperatorDetails = { operatorName: 'Existing Operator Ltd', imoNumber: '1111111' };
      setPayload({
        payloadType: 'EMP_ISSUANCE_SAVE_APPLICATION_PAYLOAD',
        emissionsMonitoringPlan: { operatorDetails: existingOperatorDetails },
      });
      tasksService.processRequestTaskAction.mockReturnValue(of(undefined));

      await firstValueFrom(service.save(buildImportData()));

      const [action] = tasksService.processRequestTaskAction.mock.calls[0];
      const payload = action.requestTaskActionPayload as any;
      expect(payload.emissionsMonitoringPlan.operatorDetails).toEqual(existingOperatorDetails);
      expect(payload.empSectionsCompleted.operatorDetails).toBeUndefined();
    });

    it('marks a subtask completed once its imported data satisfies that subtask’s completion criteria', async () => {
      tasksService.processRequestTaskAction.mockReturnValue(of(undefined));
      const plan = {
        '@_shipImoNumber': '1234567',
        ship: { name: 'MV Test', shipType: 'BULK', grossTonnage: 50000 },
        fuelConsumption: {
          procedureAnnexITableD1: {
            methodFuelConsumption: 'Estimated from bunker delivery notes',
            responsiblePerson: 'Chief Engineer',
            dataSources: 'Bunker delivery notes and flow meter logs',
            locationOfRecords: 'Onboard record book',
          },
        },
      };
      const importData: EuXmlImportData = {
        ...buildImportData(),
        dataGaps: mapDataGaps(plan).dataGaps,
      };

      await firstValueFrom(service.save(importData));

      const [action] = tasksService.processRequestTaskAction.mock.calls[0];
      const payload = action.requestTaskActionPayload as any;
      expect(payload.empSectionsCompleted.dataGaps).toBe('COMPLETED');
    });

    it('updates the store with the merged plan on success', async () => {
      tasksService.processRequestTaskAction.mockReturnValue(of(undefined));
      const importData = buildImportData();

      await firstValueFrom(service.save(importData));

      const payload = store.state.requestTaskItem.requestTask.payload as any;
      expect(payload.emissionsMonitoringPlan.abbreviations).toEqual(importData.abbreviations);
      expect(payload.empSectionsCompleted.sources).toBe('IN_PROGRESS');
    });

    it('redirects to the not-found error page when the task cannot be found', async () => {
      businessErrorService.showErrorForceNavigation.mockReturnValue(of(true));
      tasksService.processRequestTaskAction.mockReturnValue(
        throwError(() => new HttpErrorResponse({ status: 404, error: { code: 'NOTFOUND1001', data: null } })),
      );

      await firstValueFrom(service.save(buildImportData()));

      expect(businessErrorService.showErrorForceNavigation).toHaveBeenCalledTimes(1);
    });

    it('redirects to the reassigned error page when the task has been reassigned', async () => {
      businessErrorService.showErrorForceNavigation.mockReturnValue(of(true));
      tasksService.processRequestTaskAction.mockReturnValue(
        throwError(
          () => new HttpErrorResponse({ status: 400, error: { code: 'REQUEST_TASK_ACTION1001', data: null } }),
        ),
      );

      await firstValueFrom(service.save(buildImportData()));

      expect(businessErrorService.showErrorForceNavigation).toHaveBeenCalledTimes(1);
    });

    it('rethrows a FORM1001 bad request so the caller can handle form errors', async () => {
      const formError = new HttpErrorResponse({ status: 400, error: { code: 'FORM1001', data: null } });
      tasksService.processRequestTaskAction.mockReturnValue(throwError(() => formError));

      await expect(firstValueFrom(service.save(buildImportData()))).rejects.toBe(formError);
    });

    it('rethrows any other error unchanged', async () => {
      const genericError = new Error('network down');
      tasksService.processRequestTaskAction.mockReturnValue(throwError(() => genericError));

      await expect(firstValueFrom(service.save(buildImportData()))).rejects.toBe(genericError);
    });
  });
});
