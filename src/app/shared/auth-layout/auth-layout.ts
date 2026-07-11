import { Component } from '@angular/core';

@Component({
  selector: 'app-auth-layout',
  imports: [],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly currentYear = new Date().getFullYear();
}
