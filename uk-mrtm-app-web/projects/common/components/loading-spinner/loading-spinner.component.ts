import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'netz-loading-spinner',
  standalone: true,
  templateUrl: './loading-spinner.component.html',
  styleUrl: './loading-spinner.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoadingSpinnerComponent {
  readonly title = input<string>();
  readonly size = input<number>(80);
  readonly hasPaddingTop = input<boolean>(true);
}
