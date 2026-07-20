import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { Dialog } from 'primeng/dialog';
import { Select } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type PanelMemberType = 'Chairman' | 'Secretary' | 'Member';

interface PanelMember {
  type: PanelMemberType;
  name: string;
  email: string;
}

interface InterviewPanel {
  panel: string;
  panelists: PanelMember[];
}

@Component({
  selector: 'app-panel',
  imports: [ReactiveFormsModule, Menu, Dialog, Select, InputText, FileUpload, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './panel.html',
  styleUrl: './panel.css',
})
export class Panel implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    { label: 'Panel' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  panels: InterviewPanel[] = [
    {
      panel: 'Panel A',
      panelists: [
        { type: 'Chairman', name: 'Hon. Justice Mkude', email: 'mkude@jsc.go.tz' },
        { type: 'Secretary', name: 'Hon. Justice Kimaro', email: 'kimaro@jsc.go.tz' },
      ],
    },
    { panel: 'Panel B', panelists: [] },
  ];

  readonly memberTypeOptions = [
    { label: 'Chairman', value: 'Chairman' },
    { label: 'Secretary', value: 'Secretary' },
    { label: 'Member', value: 'Member' },
  ];

  actionMenuItems: MenuItem[] = [];

  showAddPanelDialog = false;
  readonly addPanelForm = this.fb.nonNullable.group({
    panel: ['', Validators.required],
  });

  showPanelistDialog = false;
  panelistPanel: InterviewPanel | null = null;
  readonly panelistForm = this.fb.group({
    members: this.fb.array<FormGroup>([]),
  });

  get members(): FormArray {
    return this.panelistForm.get('members') as FormArray;
  }

  showUploadDialog = false;
  uploadPanel: InterviewPanel | null = null;
  selectedFile: File | null = null;

  openActionMenu(event: Event, panel: InterviewPanel, menu: Menu): void {
    this.actionMenuItems = [
      { label: 'Set Panelist', icon: 'pi pi-user-plus', command: () => this.onSetPanelist(panel) },
      { label: 'View Panelists', icon: 'pi pi-eye', command: () => this.onViewPanelists(panel) },
      { label: 'Print Format', icon: 'pi pi-print', command: () => this.onPrintFormat(panel) },
      { label: 'Upload', icon: 'pi pi-upload', command: () => this.onUpload(panel) },
    ];
    menu.toggle(event);
  }

  onDistribute(): void {
    this.confirmationService.confirm({
      header: 'Distribute Candidates',
      message: 'Are you sure you want to distribute candidates across the interview panels?',
      icon: 'pi pi-share-alt',
      acceptButtonProps: { label: 'Distribute' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Candidates Distributed',
          detail: 'Candidates were distributed across the panels successfully.',
        });
      },
    });
  }

  openAddPanelDialog(): void {
    this.addPanelForm.reset();
    this.showAddPanelDialog = true;
  }

  onSaveAddPanel(): void {
    if (this.addPanelForm.invalid) {
      this.addPanelForm.markAllAsTouched();
      return;
    }

    const raw = this.addPanelForm.getRawValue();
    this.panels = [...this.panels, { panel: raw.panel, panelists: [] }];

    this.messageService.add({
      severity: 'success',
      summary: 'Panel Added',
      detail: `"${raw.panel}" was added successfully.`,
    });
    this.showAddPanelDialog = false;
  }

  onSetPanelist(panel: InterviewPanel): void {
    this.panelistPanel = panel;
    this.members.clear();
    for (const member of panel.panelists) {
      this.addMember(member);
    }
    if (panel.panelists.length === 0) {
      this.addMember();
    }
    this.showPanelistDialog = true;
  }

  addMember(member?: PanelMember): void {
    this.members.push(
      this.fb.nonNullable.group({
        type: this.fb.control<PanelMemberType | null>(member?.type ?? null, Validators.required),
        name: [member?.name ?? '', Validators.required],
        email: [member?.email ?? '', [Validators.required, Validators.email]],
      }),
    );
  }

  removeMember(index: number): void {
    this.members.removeAt(index);
  }

  onSavePanelist(): void {
    if (this.panelistForm.invalid || !this.panelistPanel) {
      this.panelistForm.markAllAsTouched();
      return;
    }

    const target = this.panelistPanel;
    const panelists = this.members.value as PanelMember[];
    this.panels = this.panels.map((panel) => (panel === target ? { ...panel, panelists } : panel));

    this.messageService.add({
      severity: 'success',
      summary: 'Panelists Saved',
      detail: `Panelists for "${target.panel}" were saved successfully.`,
    });
    this.showPanelistDialog = false;
  }

  onViewPanelists(panel: InterviewPanel): void {
    this.router.navigate(['/recruitment/interview-management', this.advertId, 'panelists'], {
      queryParams: { panel: panel.panel },
    });
  }

  onPrintFormat(panel: InterviewPanel): void {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const rows = panel.panelists.length
      ? panel.panelists
          .map(
            (member, index) =>
              `<tr><td>${index + 1}</td><td>${member.type}</td><td>${member.name}</td><td>${member.email}</td></tr>`,
          )
          .join('')
      : '<tr><td colspan="4">No panelists assigned yet</td></tr>';

    printWindow.document.write(`
      <html>
        <head>
          <title>${panel.panel} - Interview Format</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 24px; }
            h1 { font-size: 18px; }
            table { width: 100%; border-collapse: collapse; margin-top: 16px; }
            th, td { border: 1px solid #ccc; padding: 8px; text-align: left; font-size: 13px; }
          </style>
        </head>
        <body>
          <h1>${panel.panel} - Interview Format</h1>
          <table>
            <thead><tr><th>No</th><th>Type</th><th>Name</th><th>Email</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  }

  onUpload(panel: InterviewPanel): void {
    this.uploadPanel = panel;
    this.selectedFile = null;
    this.showUploadDialog = true;
  }

  onFileSelect(event: FileSelectEvent): void {
    this.selectedFile = event.files[0] ?? null;
  }

  onConfirmUpload(): void {
    if (!this.selectedFile || !this.uploadPanel) return;

    this.messageService.add({
      severity: 'success',
      summary: 'File Uploaded',
      detail: `"${this.selectedFile.name}" was uploaded for "${this.uploadPanel.panel}" successfully.`,
    });
    this.showUploadDialog = false;
  }
}
