import {
  Component,
  ElementRef,
  OnInit,
  QueryList,
  ViewChild,
  ViewChildren,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Tooltip } from 'primeng/tooltip';
import { Dialog } from 'primeng/dialog';
import { Textarea } from 'primeng/textarea';
import { Button } from 'primeng/button';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppSkeleton } from '../../../shared/app-skeleton/app-skeleton';
import {
  ApplicantApiService,
  ApplicantAcademicRecord,
  ApplicantDetailRecord,
} from '../../../core/recruitment/applicant-api.service';
import { titleCase } from '../../../core/utils';

type LevelSeverity = 'success' | 'info' | 'warn' | 'secondary';

interface ApplicantProfile {
  fullName: string;
  nin: string;
  gender: string;
  mobile: string;
  email: string;
}

interface Qualification {
  id: string;
  level: string;
  title: string;
  college: string;
  hasAttachment: boolean;
  attachmentName: string;
}

function mapProfile(record: ApplicantDetailRecord): ApplicantProfile {
  return {
    fullName: record.fullName ? titleCase(record.fullName) : '—',
    nin: record.nin ?? '—',
    gender: record.gender ? titleCase(record.gender) : '—',
    mobile: record.mobile ?? '—',
    email: record.email ?? '—',
  };
}

function mapQualification(record: ApplicantAcademicRecord): Qualification {
  const documents = record.documents ?? [];
  return {
    id: record.id,
    level: record.level?.name ?? '—',
    title: record.course?.name ?? '—',
    college: record.institutionName ?? '—',
    hasAttachment: documents.length > 0,
    attachmentName: documents.length > 0 ? 'Attachment' : '',
  };
}

function levelSeverity(level: string): LevelSeverity {
  const upper = level.toUpperCase();
  if (upper.includes('DEGREE') || upper.includes('MASTER') || upper.includes('PHD')) {
    return 'success';
  }
  if (upper.includes('DIPLOMA')) {
    return 'info';
  }
  if (upper.includes('CERTIFICATE')) {
    return 'warn';
  }
  return 'secondary';
}

@Component({
  selector: 'app-applicant-details',
  imports: [ReactiveFormsModule, Tag, Tooltip, Dialog, Textarea, Button, AppBreadcrumb, AppSkeleton],
  templateUrl: './applicant-details.html',
  styleUrl: './applicant-details.css',
})
export class ApplicantDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);
  private readonly applicantApi = inject(ApplicantApiService);

  readonly applicantId = this.route.snapshot.paramMap.get('id') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applicants', routerLink: '/recruitment/applicants' },
    { label: 'Applicant Details' },
  ];

  readonly loading = signal(true);
  readonly applicant = signal<ApplicantProfile>({ fullName: '—', nin: '—', gender: '—', mobile: '—', email: '—' });
  readonly qualifications = signal<Qualification[]>([]);

  ngOnInit(): void {
    this.loading.set(true);
    this.applicantApi
      .getApplicant(this.applicantId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (!response.data) {
            return;
          }
          this.applicant.set(mapProfile(response.data));
          this.qualifications.set((response.data.applicantAcademic ?? []).map(mapQualification));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Applicant',
            detail: 'Could not load the applicant details. Please try again later.',
          });
        },
      });
  }

  get initials(): string {
    return this.applicant()
      .fullName.split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  levelSeverity = levelSeverity;

  showAttachmentDialog = false;
  viewingAttachment: Qualification | null = null;

  readonly zoom = signal(100);
  readonly pages = [1, 2, 3];
  readonly currentPage = signal(1);

  @ViewChild('docScroll') docScrollRef?: ElementRef<HTMLElement>;
  @ViewChildren('pageEl') pageEls?: QueryList<ElementRef<HTMLElement>>;

  onViewAttachment(qualification: Qualification): void {
    this.viewingAttachment = qualification;
    this.zoom.set(100);
    this.currentPage.set(1);
    this.showAttachmentDialog = true;
    queueMicrotask(() => this.docScrollRef?.nativeElement.scrollTo({ top: 0 }));
  }

  onDocScroll(): void {
    const container = this.docScrollRef?.nativeElement;
    if (!container || !this.pageEls) {
      return;
    }

    const containerTop = container.getBoundingClientRect().top;
    const scrollTop = container.scrollTop;
    let current = 1;

    this.pageEls.forEach((pageEl, index) => {
      const offsetTop = pageEl.nativeElement.getBoundingClientRect().top - containerTop + scrollTop;
      if (scrollTop + 24 >= offsetTop) {
        current = index + 1;
      }
    });

    this.currentPage.set(current);
  }

  onZoomIn(): void {
    this.zoom.update((value) => Math.min(200, value + 10));
  }

  onZoomOut(): void {
    this.zoom.update((value) => Math.max(50, value - 10));
  }

  onPrintAttachment(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Print',
      detail: 'Printing is not available in this demo.',
    });
  }

  onDownloadAttachment(): void {
    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: 'Download is not available in this demo.',
    });
  }

  showDeleteDialog = false;
  deletingQualification: Qualification | null = null;
  readonly deleting = signal(false);

  readonly deleteForm = this.fb.nonNullable.group({
    reason: ['', Validators.required],
  });

  onDelete(qualification: Qualification): void {
    this.deletingQualification = qualification;
    this.deleteForm.reset();
    this.showDeleteDialog = true;
  }

  onConfirmDelete(): void {
    if (this.deleteForm.invalid || !this.deletingQualification) {
      this.deleteForm.markAllAsTouched();
      return;
    }

    const target = this.deletingQualification;
    const raw = this.deleteForm.getRawValue();

    this.deleting.set(true);
    this.applicantApi
      .deleteQualification(target.id, raw.reason)
      .pipe(finalize(() => this.deleting.set(false)))
      .subscribe({
        next: (response) => {
          this.qualifications.update((items) => items.filter((item) => item.id !== target.id));
          this.messageService.add({
            severity: 'success',
            summary: 'Qualification Deleted',
            detail: response.message,
          });
          this.showDeleteDialog = false;
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Delete Failed',
            detail: 'Could not delete the qualification. Please try again later.',
          });
        },
      });
  }
}
