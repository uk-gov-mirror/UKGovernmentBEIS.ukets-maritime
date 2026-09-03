import { Service } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Service()
export class RequestActionReportService {
  private printReportSubject$ = new BehaviorSubject<string | null>(null);
  printReport$ = this.printReportSubject$.asObservable();

  print(fileName: string) {
    this.printReportSubject$.next(fileName);
  }

  clear() {
    this.printReportSubject$.next(null);
  }
}
