import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { FileUpload, FileSelectEvent } from 'primeng/fileupload';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { InterviewApiService, InterviewResultRecord } from '../../../core/recruitment/interview-api.service';
import { titleCase } from '../../../core/utils';

function downloadBase64Xlsx(base64: string, filename: string): void {
  const byteCharacters = atob(base64);
  const byteArray = new Uint8Array([...byteCharacters].map((char) => char.charCodeAt(0)));
  const blob = new Blob([byteArray], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  window.URL.revokeObjectURL(url);
}

function readFileAsBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? result);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

type Gender = 'Male' | 'Female';
type ResultStatusSeverity = 'success' | 'danger' | 'warn' | 'secondary';

interface InterviewResult {
  name: string;
  interviewNo: string;
  gender: Gender;
  marks: number;
  status: string;
}

function mapResult(record: InterviewResultRecord): InterviewResult {
  return {
    name: record.applicantName,
    interviewNo: record.interviewNumber,
    gender: record.applicantGender.toUpperCase() === 'FEMALE' ? 'Female' : 'Male',
    marks: Number(record.interviewMarks),
    status: record.resultStatus,
  };
}

@Component({
  selector: 'app-result',
  imports: [ReactiveFormsModule, Tag, Dialog, InputNumber, FileUpload, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './result.html',
  styleUrl: './result.css',
})
export class Result implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);
  private readonly interviewApi = inject(InterviewApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly interviewTypeId = this.route.snapshot.paramMap.get('interviewTypeId') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems = signal<MenuItem[]>([
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    { label: 'Results' },
  ]);

  readonly loading = signal(true);
  readonly cutOff = signal(Number(this.route.snapshot.queryParamMap.get('cutOff') ?? 50));
  readonly results = signal<InterviewResult[]>([]);
  readonly exportingFormat = signal(false);

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

    this.loadResults();
  }

  private loadResults(): void {
    this.loading.set(true);
    this.interviewApi
      .getInterviewResults(Number(this.advertId), Number(this.interviewTypeId))
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.results.set((response.data ?? []).map(mapResult));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Results',
            detail: 'Could not load the interview results. Please try again later.',
          });
        },
      });
  }

  showCutOffDialog = false;
  readonly submittingCutOff = signal(false);

  readonly cutOffForm = this.fb.nonNullable.group({
    cutOff: this.fb.control<number | null>(null, [Validators.required, Validators.min(1), Validators.max(100)]),
  });

  resultStatusLabel(status: string): string {
    return titleCase(status.replace(/_/g, ' '));
  }

  resultStatusSeverity(status: string): ResultStatusSeverity {
    const upper = status.toUpperCase();
    if (upper.includes('PASS')) return 'success';
    if (upper.includes('FAIL')) return 'danger';
    if (upper.includes('NOT_DETERMINED') || upper.includes('PENDING')) return 'warn';
    return 'secondary';
  }

  openCutOffDialog(): void {
    this.cutOffForm.reset({ cutOff: this.cutOff() });
    this.showCutOffDialog = true;
  }

  onSaveCutOff(): void {
    if (this.cutOffForm.invalid) {
      this.cutOffForm.markAllAsTouched();
      return;
    }

    const raw = this.cutOffForm.getRawValue();

    this.submittingCutOff.set(true);
    this.interviewApi
      .saveResultsCutOff(Number(this.advertId), Number(this.interviewTypeId), raw.cutOff!)
      .pipe(finalize(() => this.submittingCutOff.set(false)))
      .subscribe({
        next: (response) => {
          this.cutOff.set(raw.cutOff!);
          this.messageService.add({
            severity: 'success',
            summary: 'Cut Off Saved',
            detail: response.message,
          });
          this.showCutOffDialog = false;
          this.loadResults();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Save Failed',
            detail: 'Could not save the cut off marks. Please try again later.',
          });
        },
      });
  }

  onApprove(): void {
    this.confirmationService.confirm({
      header: 'Approve Results',
      message: 'Are you sure you want to approve these interview results?',
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Approve' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Results Approved',
          detail: 'The interview results were approved successfully.',
        });
      },
    });
  }

  showUploadDialog = false;
  selectedFile: File | null = null;
  readonly submittingUpload = signal(false);

  onUploadResults(): void {
    this.selectedFile = null;
    this.showUploadDialog = true;
  }

  onFileSelect(event: FileSelectEvent): void {
    this.selectedFile = event.files[0] ?? null;
  }

  async onConfirmUpload(): Promise<void> {
    const file = this.selectedFile;
    if (!file) return;

    this.submittingUpload.set(true);
    let base64: string;
    try {
      base64 = await readFileAsBase64(file);
    } catch {
      this.submittingUpload.set(false);
      this.messageService.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: 'Could not read the selected file. Please try again.',
      });
      return;
    }

    const advertId = Number(this.advertId);
    const interviewTypeId = Number(this.interviewTypeId);

    this.interviewApi
      .uploadResults(advertId, interviewTypeId, base64)
      .pipe(finalize(() => this.submittingUpload.set(false)))
      .subscribe({
        next: () => {
          this.showUploadDialog = false;
          this.loadResults();

          this.interviewApi.getUploadStatus(advertId, interviewTypeId).subscribe({
            next: (status) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Results Uploaded',
                detail: status.message,
              });
            },
            error: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Results Uploaded',
                detail: 'The results file was uploaded successfully.',
              });
            },
          });
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Upload Failed',
            detail: 'Could not upload the results file. Please try again later.',
          });
        },
      });
  }

  onPrintFormat(): void {
    this.exportingFormat.set(true);
    this.interviewApi
      .exportDistributedApplications(Number(this.advertId), Number(this.interviewTypeId))
      .pipe(finalize(() => this.exportingFormat.set(false)))
      .subscribe({
        next: (response) => {
          const data = response.data;
          if (!data?.base64) {
            this.messageService.add({
              severity: 'error',
              summary: 'Export Failed',
              detail: 'No file was returned. Please try again later.',
            });
            return;
          }
          downloadBase64Xlsx(data.base64, `${data.advertName} - ${data.interviewTypeName} Results.xlsx`);
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Export Failed',
            detail: 'Could not export the results format. Please try again later.',
          });
        },
      });
  }
}
