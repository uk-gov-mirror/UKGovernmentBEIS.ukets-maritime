import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';

import { defer, firstValueFrom, of, take } from 'rxjs';

import { RegulatorUsersService, TasksService, UsersService } from '@mrtm/api';

import { ActivatedRouteStub, mockClass, testSchedulerFactory } from '@netz/common/testing';

import { SignatureFileDownloadComponent } from '@regulators/file-download/signature-file-download.component';
import { Mocked } from 'vitest';

describe('SignatureFileDownloadComponent', () => {
  let component: SignatureFileDownloadComponent;
  let fixture: ComponentFixture<SignatureFileDownloadComponent>;
  let regulatorUsersService: Mocked<RegulatorUsersService>;

  beforeEach(async () => {
    Object.defineProperty(window, 'onfocus', { set: vi.fn() });
    regulatorUsersService = mockClass(RegulatorUsersService);
    regulatorUsersService.generateGetRegulatorSignatureToken.mockReturnValue(
      of({ token: 'abce', tokenExpirationMinutes: 1 }) as any,
    );
    const activatedRoute = new ActivatedRouteStub({ userId: 11 });

    await TestBed.configureTestingModule({
      imports: [SignatureFileDownloadComponent],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRoute },
        { provide: RegulatorUsersService, useValue: regulatorUsersService },
        { provide: TasksService, useValue: mockClass(TasksService) },
        { provide: UsersService, useValue: { configuration: { basePath: '' } } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SignatureFileDownloadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the download link', async () => {
    await expect(firstValueFrom(component.url$)).resolves.toEqual('/v1.0/user-signatures/abce');
  });

  it('should refresh the download link', async () => {
    (regulatorUsersService.generateGetRegulatorSignatureToken.mockClear() as any).mockImplementation(() => {
      let subscribes = 0;

      return defer(() => {
        subscribes += 1;

        return subscribes === 1
          ? of({ token: 'abcf', tokenExpirationMinutes: 1 })
          : subscribes === 2
            ? of({ token: 'abcd', tokenExpirationMinutes: 2 })
            : of({ token: 'abce', tokenExpirationMinutes: 1 });
      });
    });

    testSchedulerFactory().run(({ expectObservable }) =>
      expectObservable(component.url$.pipe(take(3))).toBe('a 59s 999ms b 119s 999ms (c|)', {
        a: '/v1.0/user-signatures/abcf',
        b: '/v1.0/user-signatures/abcd',
        c: '/v1.0/user-signatures/abce',
      }),
    );
  });
});
