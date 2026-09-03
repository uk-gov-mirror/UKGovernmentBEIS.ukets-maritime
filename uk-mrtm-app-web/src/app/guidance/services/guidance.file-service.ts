import { inject, Service } from '@angular/core';

import { FileUploadService } from '@shared/services';

@Service()
export class GuidanceFileService {
  private readonly fileUploadService = inject(FileUploadService);
}
