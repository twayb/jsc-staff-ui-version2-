import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { NOT_SHORTLIST_REASONS, REVERT_REASONS } from '../longlist-data.service';
import { ApplicantPreviewApiService } from '../../../core/recruitment/applicant-preview-api.service';
import { FileUploadApiService } from '../../../core/files/file-upload-api.service';
import { LonglistApiService } from '../../../core/recruitment/longlist-api.service';
import { AttachmentEntry, mapApplicantPreview, ApplicantPreview as ApplicantPreviewData } from '../applicant-preview.model';

type ApplicantStatusSeverity = 'warn' | 'success' | 'danger';

@Component({
  selector: 'app-applicant-preview',
  imports: [Tag, Dialog, Button, Tooltip, Select, FormsModule, NgClass, RouterLink, AppBreadcrumb],
  templateUrl: './applicant-preview.html',
  styleUrl: './applicant-preview.css',
})
export class ApplicantPreview {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly applicantPreviewApi = inject(ApplicantPreviewApiService);
  private readonly fileUploadApi = inject(FileUploadApiService);
  private readonly longlistApi = inject(LonglistApiService);

  // advertId/origin are stable across prev/next (only applicationId changes), so a one-time
  // snapshot read is fine for these.
  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly origin = this.route.snapshot.paramMap.get('origin') === 'assigned' ? 'assigned' : 'longlist';

  // applicationId must stay reactive: Angular reuses this component instance when navigating
  // prev/next (same route, only the :applicationId param changes), so a snapshot read here
  // would go stale after the first load.
  readonly applicationId = signal(this.route.snapshot.paramMap.get('applicationId') ?? '');

  readonly loading = signal(true);
  readonly applicant = signal<ApplicantPreviewData | null>(null);

  // Ordered ids of every applicant in the same origin list (longlist or officer-assigned queue)
  // for this advert — lets Previous/Next step through the full list, not just this one record.
  readonly applicantIds = signal<string[]>([]);

  readonly currentIndex = computed(() => this.applicantIds().indexOf(this.applicationId()));
  readonly total = computed(() => this.applicantIds().length);
  readonly hasPrevious = computed(() => this.currentIndex() > 0);
  readonly hasNext = computed(() => {
    const index = this.currentIndex();
    return index >= 0 && index < this.total() - 1;
  });
  readonly progress = computed(() => (this.total() > 0 ? ((this.currentIndex() + 1) / this.total()) * 100 : 0));

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    {
      label: this.origin === 'assigned' ? 'Applicant Assigned' : 'Longlist',
      routerLink: ['/recruitment/applications', this.origin, this.advertId],
    },
    { label: 'Applicant Preview' },
  ];

  showAttachmentsDialog = false;
  selectedAttachment: AttachmentEntry | null = null;

  showNotShortlistDialog = false;
  notShortlistReason: string | null = null;
  readonly notShortlistReasons = NOT_SHORTLIST_REASONS;

  showRevertDialog = false;
  revertReason: string | null = null;
  readonly revertReasons = REVERT_REASONS;

  readonly zoom = signal(100);
  readonly pages = [1, 2, 3];
  readonly currentPage = signal(1);

  @ViewChild('docScroll') docScrollRef?: ElementRef<HTMLElement>;
  @ViewChildren('pageEl') pageEls?: QueryList<ElementRef<HTMLElement>>;

  @HostListener('document:keydown.arrowleft')
  onArrowLeft(): void {
    this.goToPrevious();
  }

  @HostListener('document:keydown.arrowright')
  onArrowRight(): void {
    this.goToNext();
  }

  constructor() {
    this.loadApplicant(this.applicationId());
    this.loadApplicantList();

    this.route.paramMap.subscribe((params) => {
      const applicationId = params.get('applicationId') ?? '';
      if (applicationId && applicationId !== this.applicationId()) {
        this.applicationId.set(applicationId);
        this.loadApplicant(applicationId);
      }
    });
  }

  private loadApplicant(applicationId: string): void {
    this.showAttachmentsDialog = false;
    this.selectedAttachment = null;
    this.zoom.set(100);
    this.currentPage.set(1);

    this.loading.set(true);
    this.applicantPreviewApi
      .getApplication(applicationId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.applicant.set(mapApplicantPreview(response.data));
          }
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

  private loadApplicantList(): void {
    const advertId = Number(this.advertId);

    if (this.origin === 'longlist') {
      this.longlistApi.getLonglist(advertId).subscribe({
        next: (response) => {
          this.applicantIds.set((response.data?.content ?? []).map((record) => record.applicationId));
        },
        error: () => {},
      });
      return;
    }

    this.longlistApi.getOfficerApplications(advertId).subscribe({
      next: (response) => {
        this.applicantIds.set((response.data?.content ?? []).map((record) => record.id));
      },
      error: () => {},
    });
  }

  goToPrevious(): void {
    this.navigateByOffset(-1);
  }

  goToNext(): void {
    this.navigateByOffset(1);
  }

  private navigateByOffset(offset: number): void {
    const targetId = this.applicantIds()[this.currentIndex() + offset];
    if (!targetId) {
      return;
    }
    this.router
      .navigate(['/recruitment/applications', this.origin, this.advertId, 'applicant', targetId])
      .then(() => window.scrollTo(0, 0));
  }

  statusSeverity(status: ApplicantStatusSeverity | string): ApplicantStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  onPreviewAttachments(): void {
    const attachments = this.applicant()?.attachments ?? [];
    this.selectedAttachment = attachments[0] ?? null;
    this.zoom.set(100);
    this.currentPage.set(1);
    this.showAttachmentsDialog = true;
    this.resetScroll();
  }

  onSelectAttachment(file: AttachmentEntry): void {
    this.selectedAttachment = file;
    this.zoom.set(100);
    this.currentPage.set(1);
    this.resetScroll();
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

  private resetScroll(): void {
    queueMicrotask(() => this.docScrollRef?.nativeElement.scrollTo({ top: 0 }));
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
      detail: `Printing is not available in this demo.`,
    });
  }

  onDownloadAttachment(): void {
    const attachment = this.selectedAttachment;
    if (!attachment) {
      return;
    }
    this.fileUploadApi.download(attachment.fileId).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = attachment.label;
        link.click();
        window.URL.revokeObjectURL(url);
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Download Failed',
          detail: 'Could not download the attachment. Please try again later.',
        });
      },
    });
  }

  onShortlist(): void {
    const applicant = this.applicant();
    if (!applicant) return;
    this.confirmationService.confirm({
      header: 'Shortlist Applicant',
      message: `Are you sure you want to shortlist "${applicant.name}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Shortlist' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.applicant.set({ ...applicant, status: 'Shortlisted' });
        this.messageService.add({
          severity: 'success',
          summary: 'Applicant Shortlisted',
          detail: `"${applicant.name}" was shortlisted successfully.`,
        });
      },
    });
  }

  onNotShortlist(): void {
    this.notShortlistReason = null;
    this.showNotShortlistDialog = true;
  }

  onConfirmNotShortlist(): void {
    const applicant = this.applicant();
    if (!this.notShortlistReason || !applicant) {
      return;
    }
    this.applicant.set({ ...applicant, status: 'Not Shortlisted' });
    this.messageService.add({
      severity: 'success',
      summary: 'Applicant Not Shortlisted',
      detail: `"${applicant.name}" was marked as not shortlisted.`,
    });
    this.showNotShortlistDialog = false;
  }

  onRevert(): void {
    this.revertReason = null;
    this.showRevertDialog = true;
  }

  onConfirmRevert(): void {
    const applicant = this.applicant();
    if (!this.revertReason || !applicant) {
      return;
    }
    this.applicant.set({ ...applicant, status: 'Pending' });
    this.messageService.add({
      severity: 'success',
      summary: 'Applicant Reverted',
      detail: `"${applicant.name}" was reverted to pending.`,
    });
    this.showRevertDialog = false;
  }
}
