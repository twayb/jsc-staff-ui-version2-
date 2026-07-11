import { Component, OnInit, inject, signal } from '@angular/core';
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
import { AppBreadcrumb } from '../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../shared/app-data-table/app-data-table';

type PermitTypeSeverity = 'success' | 'warn' | 'info' | 'secondary';

interface PermitScheme {
  scheme: string;
  numberOfPosts: number;
}

interface Permit {
  name: string;
  permitType: string;
  permitNo: string;
  numberOfPosts: number;
  schemes: PermitScheme[];
  startDate: string;
  endDate: string;
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
  ],
  templateUrl: './permits.html',
  styleUrl: './permits.css',
})
export class Permits implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Permits' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  permits: Permit[] = [
    {
      name: 'Ministry of Justice',
      permitType: 'Recruitment Permit',
      permitNo: 'PR-2026-001',
      numberOfPosts: 1,
      schemes: [{ scheme: 'Legal Officer Scheme', numberOfPosts: 1 }],
      startDate: '2026-01-15',
      endDate: '2026-07-15',
    },
    {
      name: 'Judiciary Registry',
      permitType: 'Recruitment Permit',
      permitNo: 'PR-2026-002',
      numberOfPosts: 1,
      schemes: [{ scheme: 'Court Administration Scheme', numberOfPosts: 1 }],
      startDate: '2026-02-01',
      endDate: '2026-08-01',
    },
    {
      name: 'Office of the Attorney General',
      permitType: 'Replacement Permit',
      permitNo: 'PR-2026-003',
      numberOfPosts: 1,
      schemes: [{ scheme: 'Legal Officer Scheme', numberOfPosts: 1 }],
      startDate: '2026-03-10',
      endDate: '2026-09-10',
    },
    {
      name: 'Public Service Commission',
      permitType: 'Recruitment Permit',
      permitNo: 'PR-2026-004',
      numberOfPosts: 1,
      schemes: [{ scheme: 'HR Officer Scheme', numberOfPosts: 1 }],
      startDate: '2026-04-05',
      endDate: '2026-10-05',
    },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingPermit: Permit | null = null;
  selectedFile: File | null = null;

  showViewDialog = false;
  viewingPermit: Permit | null = null;

  readonly permitTypeOptions = [
    { label: 'Recruitment Permit', value: 'Recruitment Permit' },
    { label: 'Replacement Permit', value: 'Replacement Permit' },
    { label: 'Renewal Permit', value: 'Renewal Permit' },
  ];

  readonly schemeOptions = [
    { label: 'Legal Officer Scheme', value: 'Legal Officer Scheme' },
    { label: 'Court Administration Scheme', value: 'Court Administration Scheme' },
    { label: 'ICT Officer Scheme', value: 'ICT Officer Scheme' },
    { label: 'HR Officer Scheme', value: 'HR Officer Scheme' },
    { label: 'Finance Officer Scheme', value: 'Finance Officer Scheme' },
    { label: 'Support Staff Scheme', value: 'Support Staff Scheme' },
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

  permitTypeSeverity(permitType: string): PermitTypeSeverity {
    switch (permitType) {
      case 'Recruitment Permit':
        return 'success';
      case 'Replacement Permit':
        return 'warn';
      case 'Renewal Permit':
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
        scheme: [scheme?.scheme ?? '', Validators.required],
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

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const permitData: Permit = {
      name: raw.name,
      permitType: raw.permitType,
      permitNo: raw.permitNo,
      numberOfPosts: raw.numberOfPosts!,
      schemes: raw.schemes as PermitScheme[],
      startDate: this.formatDate(raw.startDate!),
      endDate: this.formatDate(raw.endDate!),
    };

    if (this.dialogMode === 'edit' && this.editingPermit) {
      const target = this.editingPermit;
      this.permits = this.permits.map((p) => (p === target ? permitData : p));
      this.messageService.add({
        severity: 'success',
        summary: 'Permit Updated',
        detail: `Permit for "${permitData.name}" was updated successfully.`,
      });
    } else {
      this.permits = [permitData, ...this.permits];
      this.messageService.add({
        severity: 'success',
        summary: 'Permit Added',
        detail: `Permit for "${permitData.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
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
        this.messageService.add({
          severity: 'success',
          summary: 'Permit Approved',
          detail: `Permit for "${permit.name}" was approved successfully.`,
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
        this.permits = this.permits.filter((p) => p !== permit);
        this.messageService.add({
          severity: 'success',
          summary: 'Permit Deleted',
          detail: `Permit for "${permit.name}" was deleted successfully.`,
        });
      },
    });
  }

  private formatDate(date: Date): string {
    return date.toISOString().slice(0, 10);
  }
}
