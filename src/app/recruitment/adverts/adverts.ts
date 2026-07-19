import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Menu } from 'primeng/menu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { DatePicker } from 'primeng/datepicker';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AdvertApiService, AdvertRecord } from '../../core/recruitment/advert-api.service';
import { titleCase } from '../../core/utils';

type AdvertStateSeverity = 'success' | 'warn' | 'danger' | 'secondary';

interface Advert {
  id: number;
  referenceNo: string;
  advertName: string;
  schemeName: string;
  schemeCategory: string | null;
  salaryScale: string | null;
  duties: string | null;
  qualifications: string | null;
  numberPost: number;
  openingDate: string | null;
  closingDate: string | null;
  state: string;
  isOpen: boolean;
}

function mapAdvert(raw: AdvertRecord): Advert {
  return {
    id: raw.id,
    referenceNo: raw.referenceNumber,
    advertName: raw.advertName,
    schemeName: raw.schemeName,
    schemeCategory: raw.schemeCategory,
    salaryScale: raw.salaryScale,
    duties: raw.duties,
    qualifications: raw.qualifications,
    numberPost: Number(raw.numberPost),
    openingDate: raw.openingDate,
    closingDate: raw.closingDate,
    state: raw.state,
    isOpen: raw.advertStatus,
  };
}

@Component({
  selector: 'app-adverts',
  imports: [ReactiveFormsModule, Menu, Tag, Dialog, DatePicker, InputNumber, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './adverts.html',
  styleUrl: './adverts.css',
})
export class Adverts {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Adverts' },
  ];

  readonly loading = signal(true);

  constructor() {
    this.fetchAdverts();
  }

  private fetchAdverts(): void {
    this.loading.set(true);
    this.advertApi
      .getAdverts()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.adverts = (response.data?.content ?? []).map(mapAdvert).sort((a, b) => b.id - a.id);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Adverts',
            detail: 'Could not load the advert list. Please try again later.',
          });
        },
      });
  }

  adverts: Advert[] = [];

  actionMenuItems: MenuItem[] = [];

  showEditDialog = false;
  editingAdvert: Advert | null = null;

  showViewDialog = false;
  viewingAdvert: Advert | null = null;

  readonly submitting = signal(false);

  readonly editForm = this.fb.nonNullable.group({
    numberPost: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    openingDate: this.fb.control<Date | null>(null, Validators.required),
    closingDate: this.fb.control<Date | null>(null, Validators.required),
  });

  formatState(state: string): string {
    return titleCase(state);
  }

  advertStateSeverity(state: string): AdvertStateSeverity {
    switch (state?.toUpperCase()) {
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'NOT APPROVED':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  openActionMenu(event: Event, advert: Advert, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(advert) },
      { label: 'Update', icon: 'pi pi-pencil', command: () => this.onUpdate(advert) },
      { label: 'Approve', icon: 'pi pi-check', command: () => this.onApprove(advert) },
    ];
    menu.toggle(event);
  }

  onView(advert: Advert): void {
    this.viewingAdvert = advert;
    this.showViewDialog = true;
  }

  onUpdate(advert: Advert): void {
    this.editingAdvert = advert;
    this.editForm.reset({
      numberPost: advert.numberPost,
      openingDate: advert.openingDate ? new Date(advert.openingDate) : null,
      closingDate: advert.closingDate ? new Date(advert.closingDate) : null,
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
    this.submitting.set(true);

    this.advertApi
      .updateAdvert(target.id, {
        numberPost: raw.numberPost!,
        openingDate: this.formatDate(raw.openingDate!),
        closingDate: this.formatDate(raw.closingDate!),
      })
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Advert Updated',
            detail: `Advert "${target.advertName}" was updated successfully.`,
          });
          this.showEditDialog = false;
          this.fetchAdverts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Update Failed',
            detail: error?.error?.message ?? 'Could not update the advert. Please try again later.',
          });
        },
      });
  }

  onApprove(advert: Advert): void {
    this.confirmationService.confirm({
      header: 'Approve Advert',
      message: `Are you sure you want to approve the advert "${advert.advertName}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.advertApi.approveAdvert(advert.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Advert Approved',
              detail: `Advert "${advert.advertName}" was approved successfully.`,
            });
            this.fetchAdverts();
          },
          error: (error) => {
            const message: string = error?.error?.message ?? '';
            if (message.toLowerCase().includes('already approved')) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Advert Already Approved',
                detail: `Advert "${advert.advertName}" has already been approved.`,
              });
              this.fetchAdverts();
              return;
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Approval Failed',
              detail: message || 'Could not approve the advert. Please try again later.',
            });
          },
        });
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
