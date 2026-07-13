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
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppSkeleton } from '../../../shared/app-skeleton/app-skeleton';

type Gender = 'Male' | 'Female';
type QualificationLevel = 'Degree' | 'Diploma';
type QualificationLevelSeverity = 'success' | 'info';

interface ApplicantProfile {
  fullName: string;
  nin: string;
  gender: Gender;
  mobile: string;
  email: string;
}

interface Qualification {
  level: QualificationLevel;
  title: string;
  college: string;
  attachmentName: string;
  attachmentUrl: string;
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

  readonly nin = this.route.snapshot.paramMap.get('nin') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applicants', routerLink: '/recruitment/applicants' },
    { label: 'Applicant Details' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  applicant: ApplicantProfile = {
    fullName: 'John Mwangi',
    nin: this.nin || '19900023456780000234',
    gender: 'Male',
    mobile: '0754123456',
    email: 'john.mwangi@example.com',
  };

  qualifications: Qualification[] = [
    {
      level: 'Degree',
      title: 'Bachelor of Computer Science',
      college: 'University of Dar es Salaam',
      attachmentName: 'bachelor-certificate.pdf',
      attachmentUrl: '/assets/qualifications/bachelor-certificate.pdf',
    },
    {
      level: 'Diploma',
      title: 'Diploma in Information Technology',
      college: 'Dar es Salaam Institute of Technology',
      attachmentName: 'diploma-certificate.pdf',
      attachmentUrl: '/assets/qualifications/diploma-certificate.pdf',
    },
  ];

  get initials(): string {
    return this.applicant.fullName
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .slice(0, 2)
      .toUpperCase();
  }

  showAttachmentDialog = false;
  viewingAttachment: Qualification | null = null;

  readonly zoom = signal(100);
  readonly pages = [1, 2, 3];
  readonly currentPage = signal(1);

  @ViewChild('docScroll') docScrollRef?: ElementRef<HTMLElement>;
  @ViewChildren('pageEl') pageEls?: QueryList<ElementRef<HTMLElement>>;

  levelSeverity(level: QualificationLevel): QualificationLevelSeverity {
    return level === 'Degree' ? 'success' : 'info';
  }

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
    this.qualifications = this.qualifications.filter((item) => item !== target);
    this.messageService.add({
      severity: 'success',
      summary: 'Qualification Deleted',
      detail: `"${target.title}" was deleted successfully.`,
    });
    this.showDeleteDialog = false;
  }
}
