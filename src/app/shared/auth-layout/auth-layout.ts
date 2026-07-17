import { Component } from '@angular/core';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-auth-layout',
  imports: [Toast],
  templateUrl: './auth-layout.html',
})
export class AuthLayout {
  readonly currentYear = new Date().getFullYear();
}
