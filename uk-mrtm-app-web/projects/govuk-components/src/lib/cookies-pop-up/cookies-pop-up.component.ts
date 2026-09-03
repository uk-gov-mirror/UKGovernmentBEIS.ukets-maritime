import { ChangeDetectionStrategy, Component, input, InputSignal, output, signal } from '@angular/core';

@Component({
  selector: 'govuk-cookies-pop-up',
  standalone: true,
  templateUrl: './cookies-pop-up.component.html',
  styleUrl: './cookies-pop-up.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookiesPopUpComponent {
  readonly cookieRejected = signal(false);
  readonly cookiesExpirationTime: InputSignal<string> = input<string>();
  readonly cookiesAccepted: InputSignal<boolean> = input<boolean>();
  readonly areBrowserCookiesEnabled: InputSignal<boolean> = input<boolean>();
  readonly cookiesAcceptedEmitter = output<string>();
  readonly cookiesRejectedEmitter = output<string>();

  show = false;

  cookiesNotAccepted() {
    return this.cookiesAccepted() === false;
  }

  acceptCookies() {
    this.show = true;
    this.cookiesAcceptedEmitter.emit(this.cookiesExpirationTime());
  }

  rejectCookies() {
    this.show = true;
    this.cookieRejected.set(true);
    this.cookiesRejectedEmitter.emit(this.cookiesExpirationTime());
  }

  hideCookieMessage() {
    this.show = false;
  }
}
