import { Component, OnInit, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AppRichTextEditor } from '../../../shared/app-rich-text-editor/app-rich-text-editor';

interface CadreScheme {
  name: string;
  category: string;
  educationLevel: string;
  course: string;
  profession: string;
  duties: string;
  workExperienceYears: number;
  salaryScale: string;
  minAge: number;
  maxAge: number;
}

@Component({
  selector: 'app-cadre',
  imports: [
    ReactiveFormsModule,
    Menu,
    Dialog,
    Select,
    InputText,
    InputNumber,
    Button,
    AppRichTextEditor,
    AppBreadcrumb,
    AppDataTable,
  ],
  templateUrl: './cadre.html',
  styleUrl: './cadre.css',
})
export class Cadre implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Scheme of Service' },
    { label: 'Cadre' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  cadres: CadreScheme[] = [
    {
      name: 'Magistrate',
      category: 'Legal',
      educationLevel: "Bachelor's Degree",
      course: 'Law',
      profession: 'Magistrate',
      duties: 'Presiding over court proceedings, delivering judgments, and maintaining court records.',
      workExperienceYears: 3,
      salaryScale: 'TGS E',
      minAge: 25,
      maxAge: 45,
    },
    {
      name: 'Afisa Tehama - Usalama Wa Mifumo Ya Tehama (Ict Security) Daraja II',
      category: 'Technical',
      educationLevel: "Bachelor's Degree",
      course: 'Computer Science',
      profession: 'ICT Officer',
      duties: 'Managing system security, monitoring networks, and responding to security incidents.',
      workExperienceYears: 2,
      salaryScale: 'TGS D',
      minAge: 21,
      maxAge: 40,
    },
    {
      name: 'Afisa Hesabu Daraja II',
      category: 'Administrative',
      educationLevel: "Bachelor's Degree",
      course: 'Accounting',
      profession: 'Accountant',
      duties: 'Maintaining financial records, preparing budgets, and reconciling accounts.',
      workExperienceYears: 2,
      salaryScale: 'TGS D',
      minAge: 21,
      maxAge: 40,
    },
    {
      name: 'Msaidizi wa Hesabu Daraja I',
      category: 'Support',
      educationLevel: 'Diploma',
      course: 'Accounting',
      profession: 'Accountant',
      duties: 'Assisting with bookkeeping, filing, and processing routine financial transactions.',
      workExperienceYears: 0,
      salaryScale: 'TGS B',
      minAge: 18,
      maxAge: 35,
    },
  ];

  readonly categoryOptions = [
    { label: 'Legal', value: 'Legal' },
    { label: 'Administrative', value: 'Administrative' },
    { label: 'Technical', value: 'Technical' },
    { label: 'Support', value: 'Support' },
  ];

  readonly educationLevelOptions = [
    { label: 'Certificate', value: 'Certificate' },
    { label: 'Diploma', value: 'Diploma' },
    { label: "Bachelor's Degree", value: "Bachelor's Degree" },
    { label: "Master's Degree", value: "Master's Degree" },
    { label: 'PhD', value: 'PhD' },
  ];

  readonly courseOptions = [
    { label: 'Law', value: 'Law' },
    { label: 'Accounting', value: 'Accounting' },
    { label: 'Computer Science', value: 'Computer Science' },
    { label: 'Information Technology', value: 'Information Technology' },
    { label: 'Public Administration', value: 'Public Administration' },
    { label: 'Business Administration', value: 'Business Administration' },
  ];

  readonly professionOptions = [
    { label: 'Magistrate', value: 'Magistrate' },
    { label: 'Advocate', value: 'Advocate' },
    { label: 'Accountant', value: 'Accountant' },
    { label: 'ICT Officer', value: 'ICT Officer' },
    { label: 'Administrator', value: 'Administrator' },
    { label: 'Auditor', value: 'Auditor' },
  ];

  readonly salaryScaleOptions = [
    { label: 'TGS A', value: 'TGS A' },
    { label: 'TGS B', value: 'TGS B' },
    { label: 'TGS C', value: 'TGS C' },
    { label: 'TGS D', value: 'TGS D' },
    { label: 'TGS E', value: 'TGS E' },
    { label: 'TGS F', value: 'TGS F' },
    { label: 'TGS G', value: 'TGS G' },
    { label: 'TGS H', value: 'TGS H' },
    { label: 'TGS I', value: 'TGS I' },
    { label: 'TGS J', value: 'TGS J' },
  ];

  actionMenuItems: MenuItem[] = [];

  showFormDialog = false;
  dialogMode: 'add' | 'edit' = 'add';
  editingCadre: CadreScheme | null = null;

  readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    category: ['', Validators.required],
    educationLevel: ['', Validators.required],
    course: ['', Validators.required],
    profession: ['', Validators.required],
    duties: ['', Validators.required],
    workExperienceYears: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    salaryScale: ['', Validators.required],
    minAge: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
    maxAge: this.fb.control<number | null>(null, [Validators.required, Validators.min(0)]),
  });

  showViewDialog = false;
  viewingCadre: CadreScheme | null = null;

  openActionMenu(event: Event, cadre: CadreScheme, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Edit', icon: 'pi pi-pencil', command: () => this.onEdit(cadre) },
      { label: 'View', icon: 'pi pi-eye', command: () => this.onView(cadre) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(cadre) },
    ];
    menu.toggle(event);
  }

  openAddDialog(): void {
    this.dialogMode = 'add';
    this.editingCadre = null;
    this.form.reset();
    this.showFormDialog = true;
  }

  onEdit(cadre: CadreScheme): void {
    this.dialogMode = 'edit';
    this.editingCadre = cadre;
    this.form.reset({ ...cadre });
    this.showFormDialog = true;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    const cadre: CadreScheme = {
      name: raw.name,
      category: raw.category,
      educationLevel: raw.educationLevel,
      course: raw.course,
      profession: raw.profession,
      duties: raw.duties,
      workExperienceYears: raw.workExperienceYears!,
      salaryScale: raw.salaryScale,
      minAge: raw.minAge!,
      maxAge: raw.maxAge!,
    };

    if (this.dialogMode === 'edit' && this.editingCadre) {
      const target = this.editingCadre;
      this.cadres = this.cadres.map((item) => (item === target ? cadre : item));
      this.messageService.add({
        severity: 'success',
        summary: 'Cadre Updated',
        detail: `"${cadre.name}" was updated successfully.`,
      });
    } else {
      this.cadres = [...this.cadres, cadre];
      this.messageService.add({
        severity: 'success',
        summary: 'Cadre Added',
        detail: `"${cadre.name}" was added successfully.`,
      });
    }

    this.showFormDialog = false;
  }

  onView(cadre: CadreScheme): void {
    this.viewingCadre = cadre;
    this.showViewDialog = true;
  }

  onDelete(cadre: CadreScheme): void {
    this.confirmationService.confirm({
      header: 'Delete Cadre',
      message: `Are you sure you want to delete "${cadre.name}"? This action cannot be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.cadres = this.cadres.filter((item) => item !== cadre);
        this.messageService.add({
          severity: 'success',
          summary: 'Cadre Deleted',
          detail: `"${cadre.name}" was deleted successfully.`,
        });
      },
    });
  }
}
