import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type PanelMemberType = 'Chairman' | 'Secretary' | 'Member';
type PanelMemberTypeSeverity = 'info' | 'warn' | 'secondary';

interface PanelMember {
  type: PanelMemberType;
  name: string;
  email: string;
}

@Component({
  selector: 'app-panelists',
  imports: [ReactiveFormsModule, Menu, Tag, Dialog, Select, InputText, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './panelists.html',
  styleUrl: './panelists.css',
})
export class Panelists implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly panel = this.route.snapshot.queryParamMap.get('panel') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    { label: 'Panel', routerLink: `/recruitment/interview-management/${this.advertId}/panel` },
    { label: this.panel },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  members: PanelMember[] = [
    { type: 'Chairman', name: 'Hon. Justice Mkude', email: 'mkude@jsc.go.tz' },
    { type: 'Secretary', name: 'Hon. Justice Kimaro', email: 'kimaro@jsc.go.tz' },
    { type: 'Member', name: 'Dr. Amina Juma', email: 'amina.juma@jsc.go.tz' },
  ];

  readonly memberTypeOptions = [
    { label: 'Chairman', value: 'Chairman' },
    { label: 'Secretary', value: 'Secretary' },
    { label: 'Member', value: 'Member' },
  ];

  actionMenuItems: MenuItem[] = [];

  showEditDialog = false;
  editingMember: PanelMember | null = null;

  readonly editForm = this.fb.nonNullable.group({
    type: this.fb.control<PanelMemberType | null>(null, Validators.required),
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
  });

  memberTypeSeverity(type: PanelMemberType): PanelMemberTypeSeverity {
    switch (type) {
      case 'Chairman':
        return 'info';
      case 'Secretary':
        return 'warn';
      default:
        return 'secondary';
    }
  }

  openActionMenu(event: Event, member: PanelMember, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Print Format', icon: 'pi pi-print', command: () => this.onPrintFormat(member) },
      { label: 'Edit Member', icon: 'pi pi-pencil', command: () => this.onEdit(member) },
      { separator: true },
      { label: 'Delete', icon: 'pi pi-trash', command: () => this.onDelete(member) },
    ];
    menu.toggle(event);
  }

  onEdit(member: PanelMember): void {
    this.editingMember = member;
    this.editForm.reset({ type: member.type, name: member.name, email: member.email });
    this.showEditDialog = true;
  }

  onSaveEdit(): void {
    if (this.editForm.invalid || !this.editingMember) {
      this.editForm.markAllAsTouched();
      return;
    }

    const raw = this.editForm.getRawValue();
    const target = this.editingMember;
    this.members = this.members.map((member) =>
      member === target ? { type: raw.type!, name: raw.name, email: raw.email } : member,
    );

    this.messageService.add({
      severity: 'success',
      summary: 'Member Updated',
      detail: `"${raw.name}" was updated successfully.`,
    });
    this.showEditDialog = false;
  }

  onDelete(member: PanelMember): void {
    this.confirmationService.confirm({
      header: 'Delete Panelist',
      message: `Are you sure you want to remove "${member.name}" from this panel?`,
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { label: 'Delete', severity: 'danger' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.members = this.members.filter((item) => item !== member);
        this.messageService.add({
          severity: 'success',
          summary: 'Panelist Removed',
          detail: `"${member.name}" was removed successfully.`,
        });
      },
    });
  }

  onPrintFormat(member: PanelMember): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>${member.name} - Panel Member Format</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${this.panel} - Panel Member Format</h1>
          <table>
            <thead><tr><th>Member Type</th><th>Name</th><th>Email</th></tr></thead>
            <tbody><tr><td>${member.type}</td><td>${member.name}</td><td>${member.email}</td></tr></tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }
}
