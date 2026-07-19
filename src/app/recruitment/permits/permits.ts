import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Menu } from 'primeng/menu';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { DatePicker } from 'primeng/datepicker';
import { Tag } from 'primeng/tag';
import { FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { finalize, map, of, switchMap } from 'rxjs';
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';
import { CountUp } from '../../shared/count-up.directive';
import { PermitInput, PermitRecord, PermitsApiService } from '../../core/recruitment/permits-api.service';
import { FileUploadApiService } from '../../core/files/file-upload-api.service';
import { titleCase } from '../../core/utils';

type PermitTypeSeverity = 'success' | 'warn' | 'info' | 'secondary';
type PermitStatusSeverity = 'success' | 'warn' | 'info' | 'danger' | 'secondary';

interface PermitScheme {
  schemeId: number;
  scheme: string;
  numberOfPosts: number;
}

interface Permit {
  id: string;
  name: string;
  permitType: string;
  permitNo: string;
  status: string;
  numberOfPosts: number;
  schemes: PermitScheme[];
  startDate: string;
  endDate: string;
  fileId: string | null;
  createdAt: string;
}

function mapPermit(raw: PermitRecord): Permit {
  return {
    id: raw.id,
    name: raw.name,
    permitType: raw.permitType,
    permitNo: raw.permitNo,
    status: raw.status,
    numberOfPosts: raw.numberOfPost,
    schemes: raw.permitSchemes.map((entry) => ({
      schemeId: entry.scheme.id,
      scheme: entry.scheme.name,
      numberOfPosts: entry.numberOfPost,
    })),
    startDate: raw.startDate,
    endDate: raw.endDate,
    fileId: raw.fileId,
    createdAt: raw.createdAt,
  };
}

@Component({
  selector: 'app-permits',
  imports: [
    ReactiveFormsModule,
    Button,
    InputText,
    InputNumber,
    Menu,
    Dialog,
    Select,
    DatePicker,
    Tag,
    FileUpload,
    AppBreadcrumb,
    AppDataTable,
    AppSkeleton,
    CountUp,
  ],
  templateUrl: './permits.html',
  styleUrl: './permits.css',
})
export class Permits {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly permitsApi = inject(PermitsApiService);
  private readonly fileUploadApi = inject(FileUploadApiService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Permits' },
  ];

  readonly loading = signal(true);
  readonly schemeOptions = signal<{ label: string; value: number }[]>([]);

  constructor() {
    this.fetchPermits();

    this.permitsApi.getSchemes().subscribe({
      next: (response) => this.schemeOptions.set((response.data ?? []).map((s) => ({ label: s.name, value: s.id }))),
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Failed to Load Schemes',
          detail: 'Could not load the scheme list. Please try again later.',
        });
      },
    });
  }

  private fetchPermits(): void {
    this.loading.set(true);
    this.permitsApi
      .getPermits()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.permits = (response.data ?? [])
            .map(mapPermit)
            .sort((a, b) => new Date(b.createdAt || b.startDate).getTime() - new Date(a.createdAt || a.startDate).getTime());
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Permits',
            detail: 'Could not load the permit list. Please try again later.',
          });
        },
      });
  }

  permits: Permit[] = [];

  get totalPermits(): number {
    return this.permits.length;
  }

  get permitsThisYear(): number {
    const currentYear = new Date().getFullYear();
    return this.permits.filter((p) => new Date(p.startDate).getFullYear() === currentYear).length;
  }

  get permitTypesCount(): number {
    return new Set(this.permits.map((p) => p.permitType)).size;
  }

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingPermit: Permit | null = null;
  selectedFile: File | null = null;

  showViewDialog = false;
  viewingPermit: Permit | null = null;

  readonly permitTypeOptions = [
    { label: 'New Hire', value: 'NEW HIRE' },
    { label: 'Replacement', value: 'REPLACEMENT' },
    { label: 'Promotion', value: 'PROMOTION' },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    permitType: ['', Validators.required],
    permitNo: ['', Validators.required],
    startDate: this.fb.control<Date | null>(null, Validators.required),
    endDate: this.fb.control<Date | null>(null, Validators.required),
    numberOfPosts: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
    schemes: this.fb.array<FormGroup>([]),
  });

  get schemes(): FormArray {
    return this.form.get('schemes') as FormArray;
  }

  formatPermitType(permitType: string): string {
    return titleCase(permitType);
  }

  formatPermitStatus(status: string): string {
    return titleCase(status);
  }

  permitStatusSeverity(status: string): PermitStatusSeverity {
    switch (status?.toUpperCase()) {
      case 'NEW':
        return 'info';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'EXPIRED':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  permitTypeSeverity(permitType: string): PermitTypeSeverity {
    switch (permitType.toUpperCase()) {
      case 'NEW HIRE':
        return 'success';
      case 'REPLACEMENT':
        return 'warn';
      case 'PROMOTION':
        return 'info';
      default:
        return 'secondary';
    }
  }

  openActionMenu(event: Event, permit: Permit, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(permit) },
      { label: 'Approve', icon: 'pi pi-check', command: () => this.onApprove(permit) },
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(permit) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(permit) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingPermit = null;
    this.form.reset();
    this.schemes.clear();
    this.selectedFile = null;
    this.showFormDialog = true;
  }

  addScheme(scheme?: PermitScheme): void {
    this.schemes.push(
      this.fb.nonNullable.group({
        schemeId: this.fb.control<number | null>(scheme?.schemeId ?? null, Validators.required),
        numberOfPosts: this.fb.control<number | null>(scheme?.numberOfPosts ?? null, [
          Validators.required,
          Validators.min(1),
        ]),
      }),
    );
  }

  removeScheme(index: number): void {
    this.schemes.removeAt(index);
  }

  onFileSelect(event: FileSelectEvent): void {
    this.selectedFile = event.files[0] ?? null;
  }

  readonly submitting = signal(false);

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.dialogMode === 'add' && !this.selectedFile) {
      this.messageService.add({
        severity: 'error',
        summary: 'File Required',
        detail: 'Please attach the permit document.',
      });
      return;
    }

    const raw = this.form.getRawValue();
    const schemeInputs = raw.schemes as { schemeId: number; numberOfPosts: number }[];
    this.submitting.set(true);

    const fileId$ = this.selectedFile
      ? this.fileUploadApi.upload(this.selectedFile, 'PERMIT', raw.name).pipe(map((response) => response.data.id))
      : of(this.editingPermit?.fileId ?? '');

    fileId$
      .pipe(
        switchMap((fileId) => {
          const payload: PermitInput = {
            name: raw.name,
            permitType: raw.permitType,
            permitNo: raw.permitNo,
            startDate: this.formatDate(raw.startDate!),
            endDate: this.formatDate(raw.endDate!),
            numberOfPost: raw.numberOfPosts!,
            fileId,
            permitSchemes: schemeInputs.map((s) => ({ schemeId: s.schemeId, numberOfPost: s.numberOfPosts })),
          };
          return this.dialogMode === 'edit' && this.editingPermit
            ? this.permitsApi.updatePermit(this.editingPermit.id, payload)
            : this.permitsApi.createPermit(payload);
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: this.dialogMode === 'edit' ? 'Permit Updated' : 'Permit Added',
            detail: `Permit for "${raw.name}" was ${this.dialogMode === 'edit' ? 'updated' : 'added'} successfully.`,
          });
          this.showFormDialog = false;
          this.fetchPermits();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.dialogMode === 'edit' ? 'Update Failed' : 'Add Failed',
            detail: error?.error?.message ?? 'Something went wrong. Please try again later.',
          });
        },
      });
  }

  onEdit(permit: Permit): void {
    this.dialogMode = 'edit';
    this.editingPermit = permit;
    this.selectedFile = null;

    this.form.reset();
    this.form.patchValue({
      name: permit.name,
      permitType: permit.permitType,
      permitNo: permit.permitNo,
      startDate: new Date(permit.startDate),
      endDate: new Date(permit.endDate),
      numberOfPosts: permit.numberOfPosts,
    });

    this.schemes.clear();
    for (const scheme of permit.schemes) {
      this.addScheme(scheme);
    }

    this.showFormDialog = true;
  }

  onApprove(permit: Permit): void {
    this.confirmationService.confirm({
      header: 'Approve Permit',
      message: `Are you sure you want to approve the permit for "${permit.name}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.permitsApi.approvePermit(permit.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Permit Approved',
              detail: `Permit for "${permit.name}" was approved successfully.`,
            });
            this.fetchPermits();
          },
          error: (error) => {
            const message: string = error?.error?.message ?? '';
            if (message.toLowerCase().includes('advert already exists')) {
              this.messageService.add({
                severity: 'warn',
                summary: 'Permit Already Approved',
                detail: `Permit for "${permit.name}" has already been approved.`,
              });
              this.fetchPermits();
              return;
            }
            this.messageService.add({
              severity: 'error',
              summary: 'Approval Failed',
              detail: message || 'Could not approve the permit. Please try again later.',
            });
          },
        });
      },
    });
  }

  onView(permit: Permit): void {
    this.viewingPermit = permit;
    this.showViewDialog = true;
  }

  onDelete(permit: Permit): void {
    this.confirmationService.confirm({
      header: 'Delete Permit',
      message: `Are you sure you want to delete the permit for "${permit.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.permitsApi.deletePermit(permit.id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Permit Deleted',
              detail: `Permit for "${permit.name}" was deleted successfully.`,
            });
            this.fetchPermits();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Delete Failed',
              detail: error?.error?.message ?? 'Could not delete the permit. Please try again later.',
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
