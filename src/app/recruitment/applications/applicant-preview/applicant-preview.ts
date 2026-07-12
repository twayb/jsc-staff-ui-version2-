import { Component, ElementRef, HostListener, QueryList, ViewChild, ViewChildren, computed, inject, signal } from '@angular/core';
import { NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { Button } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Select } from 'primeng/select';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { ApplicantStatus, LonglistDataService, NOT_SHORTLIST_REASONS, REVERT_REASONS } from '../longlist-data.service';

type ApplicantStatusSeverity = 'warn' | 'success' | 'danger';

@Component({
  selector: 'app-applicant-preview',
  imports: [Tag, Dialog, Button, Tooltip, Select, FormsModule, NgClass, AppBreadcrumb],
  templateUrl: './applicant-preview.html',
  styleUrl: './applicant-preview.css',
})
export class ApplicantPreview {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);
  private readonly longlistData = inject(LonglistDataService);

  readonly referenceNo = this.route.snapshot.paramMap.get('referenceNo') ?? '';
  readonly origin = this.route.snapshot.paramMap.get('origin') === 'assigned' ? 'assigned' : 'longlist';

  readonly applicants = this.longlistData.applicants;

  readonly currentIndex = signal(
    Math.max(0, this.longlistData.getIndex(this.route.snapshot.paramMap.get('nin') ?? '')),
  );

  readonly total = computed(() => this.applicants().length);
  readonly applicant = computed(() => this.applicants()[this.currentIndex()]);
  readonly hasPrevious = computed(() => this.currentIndex() > 0);
  readonly hasNext = computed(() => this.currentIndex() < this.total() - 1);
  readonly progress = computed(() => ((this.currentIndex() + 1) / this.total()) * 100);

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Applications', routerLink: '/recruitment/applications' },
    {
      label: this.origin === 'assigned' ? 'Applicant Assigned' : 'Longlist',
      routerLink: ['/recruitment/applications', this.origin, this.referenceNo],
    },
    { label: 'Applicant Preview' },
  ];

  showAttachmentsDialog = false;
  selectedAttachment = '';

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

  statusSeverity(status: ApplicantStatus): ApplicantStatusSeverity {
    if (status === 'Shortlisted') return 'success';
    if (status === 'Not Shortlisted') return 'danger';
    return 'warn';
  }

  goToPrevious(): void {
    if (!this.hasPrevious()) {
      return;
    }
    this.currentIndex.update((index) => index - 1);
    this.syncUrl();
  }

  goToNext(): void {
    if (!this.hasNext()) {
      return;
    }
    this.currentIndex.update((index) => index + 1);
    this.syncUrl();
  }

  private syncUrl(): void {
    this.router.navigate(
      ['/recruitment/applications', this.origin, this.referenceNo, 'applicant', this.applicant().nin],
      { replaceUrl: true },
    );
  }

  onPreviewAttachments(): void {
    this.selectedAttachment = this.applicant().attachments[0];
    this.zoom.set(100);
    this.currentPage.set(1);
    this.showAttachmentsDialog = true;
    this.resetScroll();
  }

  onSelectAttachment(file: string): void {
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
    this.messageService.add({
      severity: 'info',
      summary: 'Download',
      detail: `Download is not available in this demo.`,
    });
  }

  onShortlist(): void {
    const applicant = this.applicant();
    this.confirmationService.confirm({
      header: 'Shortlist Applicant',
      message: `Are you sure you want to shortlist "${applicant.name}"?`,
      icon: 'pi pi-check-circle',
      acceptButtonProps: { label: 'Shortlist' },
      rejectButtonProps: { label: 'Cancel', severity: 'secondary', outlined: true },
      accept: () => {
        this.longlistData.setStatus(applicant.nin, 'Shortlisted');
        this.messageService.add({
          severity: 'success',
          summary: 'Applicant Shortlisted',
          detail: `"${applicant.name}" was shortlisted successfully.`,
        });
        this.advanceAfterDecision();
      },
    });
  }

  onNotShortlist(): void {
    this.notShortlistReason = null;
    this.showNotShortlistDialog = true;
  }

  onConfirmNotShortlist(): void {
    if (!this.notShortlistReason) {
      return;
    }
    const applicant = this.applicant();
    this.longlistData.setNotShortlisted(applicant.nin, this.notShortlistReason);
    this.messageService.add({
      severity: 'success',
      summary: 'Applicant Not Shortlisted',
      detail: `"${applicant.name}" was marked as not shortlisted.`,
    });
    this.showNotShortlistDialog = false;
    this.advanceAfterDecision();
  }

  onRevert(): void {
    this.revertReason = null;
    this.showRevertDialog = true;
  }

  onConfirmRevert(): void {
    if (!this.revertReason) {
      return;
    }
    const applicant = this.applicant();
    this.longlistData.revertToPending(applicant.nin, this.revertReason);
    this.messageService.add({
      severity: 'success',
      summary: 'Applicant Reverted',
      detail: `"${applicant.name}" was reverted to pending.`,
    });
    this.showRevertDialog = false;
  }

  private advanceAfterDecision(): void {
    if (this.hasNext()) {
      this.goToNext();
      return;
    }
    this.messageService.add({
      severity: 'info',
      summary: 'Review Complete',
      detail: 'You have reviewed all longlisted applicants.',
    });
    this.router.navigate(['/recruitment/applications', this.origin, this.referenceNo]);
  }
}
