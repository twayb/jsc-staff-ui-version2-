import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AppHeader } from '../app-header/app-header';
import { AppFooter } from '../app-footer/app-footer';

@Component({
  selector: 'app-service-layout',
  imports: [RouterOutlet, AppHeader, AppFooter],
  templateUrl: './service-layout.html',
})
export class ServiceLayout {}
