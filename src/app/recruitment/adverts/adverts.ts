import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Menu } from 'primeng/menu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';

type AdvertStatus = 'Open' | 'Closed';
type AdvertStatusSeverity = 'success' | 'danger';

interface Advert {
  referenceNo: string;
  cadre: string;
  posts: number;
  openingDate: string;
  closingDate: string;
  status: AdvertStatus;
}

@Component({
  selector: 'app-adverts',
  imports: [ReactiveFormsModule, Menu, Tag, Dialog, DatePicker, InputNumber, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './adverts.html',
  styleUrl: './adverts.css',
})
export class Adverts implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Adverts' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  adverts: Advert[] = [
    {
      referenceNo: 'ADV-2026-001',
      cadre: 'Magistrate',
      posts: 5,
      openingDate: '2026-01-10',
      closingDate: '2026-02-10',
      status: 'Open',
    },
    {
      referenceNo: 'ADV-2026-002',
      cadre: 'Court Clerk',
      posts: 8,
      openingDate: '2026-02-01',
      closingDate: '2026-03-01',
      status: 'Open',
    },
    {
      referenceNo: 'ADV-2026-003',
      cadre: 'Legal Officer',
      posts: 3,
      openingDate: '2025-11-15',
      closingDate: '2025-12-15',
      status: 'Closed',
    },
    {
      referenceNo: 'ADV-2026-004',
      cadre: 'Research Officer',
      posts: 2,
      openingDate: '2025-12-01',
      closingDate: '2026-01-01',
      status: 'Closed',
    },
  ];

  actionMenuItems: MenuItem[] = [];

  showEditDialog = false;
  editingAdvert: Advert | null = null;

  readonly editForm = this.fb.nonNullable.group({
    posts: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    openingDate: this.fb.control<Date | null>(null, Validators.required),
    closingDate: this.fb.control<Date | null>(null, Validators.required),
  });

  advertStatusSeverity(status: AdvertStatus): AdvertStatusSeverity {
    return status === 'Open' ? 'success' : 'danger';
  }

  openActionMenu(event: Event, advert: Advert, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Update', icon: 'pi pi-pencil', command: () => this.onUpdate(advert) },
      { label: 'Approve', icon: 'pi pi-check', command: () => this.onApprove(advert) },
    ];
    menu.toggle(event);
  }

  onUpdate(advert: Advert): void {
    this.editingAdvert = advert;
    this.editForm.reset({
      posts: advert.posts,
      openingDate: new Date(advert.openingDate),
      closingDate: new Date(advert.closingDate),
    });
    this.showEditDialog = true;
  }

  onSaveEdit(): void {
    if (this.editForm.invalid || !this.editingAdvert) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.getRawValue();
    const target = this.editingAdvert;
    this.adverts = this.adverts.map((advert) =>
      advert === target
        ? {
            ...advert,
            posts: raw.posts!,
            openingDate: this.formatDate(raw.openingDate!),
            closingDate: this.formatDate(raw.closingDate!),
          }
        : advert,
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Advert Updated',
      detail: `Advert "${target.referenceNo}" was updated successfully.`,
    });
    this.showEditDialog = false;
  }

  onApprove(advert: Advert): void {
    this.confirmationService.confirm({
      header: 'Approve Advert',
      message: `Are you sure you want to approve the advert "${advert.referenceNo}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Advert Approved',
          detail: `Advert "${advert.referenceNo}" was approved successfully.`,
        });
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
