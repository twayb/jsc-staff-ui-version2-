import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { InterviewApiService, PanelMemberRecord } from '../../../core/recruitment/interview-api.service';

type PanelMemberType = 'Chairman' | 'Secretary' | 'Member';
type PanelMemberTypeSeverity = 'info' | 'warn' | 'secondary';

interface PanelMember {
  id: number;
  type: PanelMemberType;
  name: string;
  email: string;
}

function memberTypeFromApi(type: PanelMemberRecord['memberType']): PanelMemberType {
  if (type === 'SECRETARY') return 'Secretary';
  if (type === 'MEMBER') return 'Member';
  return 'Chairman';
}

function mapPanelMember(record: PanelMemberRecord): PanelMember {
  return {
    id: record.id,
    type: memberTypeFromApi(record.memberType),
    name: record.name,
    email: record.email,
  };
}

@Component({
  selector: 'app-panelists',
  imports: [ReactiveFormsModule, Menu, Tag, Dialog, Select, InputText, InputNumber, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './panelists.html',
  styleUrl: './panelists.css',
})
export class Panelists implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);
  private readonly interviewApi = inject(InterviewApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly panel = this.route.snapshot.queryParamMap.get('panel') ?? '';
  readonly panelId = this.route.snapshot.queryParamMap.get('panelId') ?? '';
  readonly interviewId = this.route.snapshot.queryParamMap.get('interviewId') ?? '';

  readonly breadcrumbItems = signal<MenuItem[]>([
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    { label: 'Panel', routerLink: `/recruitment/interview-management/${this.advertId}/panel/${this.interviewId}` },
    { label: this.panel },
  ]);

  readonly loading = signal(true);
  readonly members = signal<PanelMember[]>([]);

  ngOnInit(): void {
    this.advertApi.getAdvert(Number(this.advertId)).subscribe({
      next: (response) => {
        const name = response.data?.advertName;
        if (name) {
          this.breadcrumbItems.update((items) => items.map((item, index) => (index === 2 ? { ...item, label: name } : item)));
        }
      },
      error: () => {},
    });

    this.loading.set(true);
    this.interviewApi
      .getPanelMembers(Number(this.panelId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.members.set((response.data ?? []).map(mapPanelMember));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Panelists',
            detail: 'Could not load the panelists. Please try again later.',
          });
        },
      });
  }

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

  showExportDialog = false;
  exportMember: PanelMember | null = null;
  readonly exportingFormat = signal(false);

  readonly exportForm = this.fb.nonNullable.group({
    numberOfQuestions: this.fb.control<number | null>(null, [Validators.required, Validators.min(1)]),
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

  // Not wired yet: editing/removing a single panelist would need to resubmit the full
  // membership list via setPanelMembers (the only confirmed endpoint is bulk "set", not a
  // single-member update/delete) — needs confirmation before wiring for real.
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
    this.members.update((list) =>
      list.map((member) => (member === target ? { ...member, type: raw.type!, name: raw.name, email: raw.email } : member)),
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
        this.members.update((list) => list.filter((item) => item !== member));
        this.messageService.add({
          severity: 'success',
          summary: 'Panelist Removed',
          detail: `"${member.name}" was removed successfully.`,
        });
      },
    });
  }

  onPrintFormat(member: PanelMember): void {
    this.exportMember = member;
    this.exportForm.reset();
    this.showExportDialog = true;
  }

  onSubmitExport(): void {
    if (this.exportForm.invalid || !this.exportMember) {
      this.exportForm.markAllAsTouched();
      return;
    }

    const raw = this.exportForm.getRawValue();
    const target = this.exportMember;

    this.exportingFormat.set(true);
    this.interviewApi
      .exportPanelistOralFormat(target.id, raw.numberOfQuestions!)
      .pipe(finalize(() => this.exportingFormat.set(false)))
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `${target.name}-oral-interview-format.xlsx`;
          link.click();
          window.URL.revokeObjectURL(url);
          this.showExportDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Export Failed',
            detail: 'Could not export the oral interview format. Please try again later.',
          });
        },
      });
  }
}
