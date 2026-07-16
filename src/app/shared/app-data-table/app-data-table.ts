import { Component, ContentChild, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Table, TableModule } from 'primeng/table';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { AppSkeleton } from '../app-skeleton/app-skeleton';

@Component({
  selector: 'app-data-table',
  imports: [NgClass, NgTemplateOutlet, TableModule, Button, InputText, IconField, InputIcon, AppSkeleton],
  templateUrl: './app-data-table.html',
})
export class AppDataTable<T = unknown> {
  @Input() title = '';
  @Input() subtitle = '';
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() card = true;
  @Input() searchFields: string[] = [];
  @Input() addLabel: string | null = null;
  @Input() addIcon = 'pi pi-plus';
  @Input() rows = 5;
  @Input() rowsPerPageOptions = [5, 10, 20];
  @Input() scrollHeight = '400px';
  @Input() skeletonColumns = 8;
  @Input() skeletonRows = 5;
  @Input() dataKey?: string;

  @Output() add = new EventEmitter<void>();

  @ViewChild('dt') dt?: Table;

  @ContentChild('headerTpl') headerTemplate?: TemplateRef<unknown>;
  @ContentChild('bodyTpl') bodyTemplate?: TemplateRef<unknown>;
  @ContentChild('emptyTpl') emptyTemplate?: TemplateRef<unknown>;
}
