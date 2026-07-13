import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ConfirmationService, MenuItem, MessageService } from 'primeng/api';
import { Tag } from 'primeng/tag';
import { Dialog } from 'primeng/dialog';
import { InputNumber } from 'primeng/inputnumber';
import { Button } from 'primeng/button';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type Gender = 'Male' | 'Female';
type ResultStatus = 'Pass' | 'Fail';
type ResultStatusSeverity = 'success' | 'danger';

interface InterviewResult {
  name: string;
  interviewNo: string;
  gender: Gender;
  marks: number;
  status: ResultStatus;
}

@Component({
  selector: 'app-result',
  imports: [ReactiveFormsModule, Tag, Dialog, InputNumber, Button, AppBreadcrumb, AppDataTable],
  templateUrl: './result.html',
  styleUrl: './result.css',
})
export class Result implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly messageService = inject(MessageService);

  readonly permitNo = this.route.snapshot.paramMap.get('permitNo') ?? '';
  readonly interviewTitle = this.route.snapshot.queryParamMap.get('title') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.permitNo, routerLink: `/recruitment/interview-management/${this.permitNo}` },
    { label: 'Results' },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  cutOff = 50;

  results: InterviewResult[] = [
    { name: 'John Mwangi', interviewNo: 'INT-2026-001', gender: 'Male', marks: 72, status: 'Pass' },
    { name: 'Amina Hassan', interviewNo: 'INT-2026-002', gender: 'Female', marks: 45, status: 'Fail' },
    { name: 'Fatma Salim', interviewNo: 'INT-2026-003', gender: 'Female', marks: 58, status: 'Pass' },
    { name: 'Juma Kessy', interviewNo: 'INT-2026-004', gender: 'Male', marks: 38, status: 'Fail' },
  ];

  showCutOffDialog = false;

  readonly cutOffForm = this.fb.nonNullable.group({
    cutOff: this.fb.control<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)]),
  });

  resultStatusSeverity(status: ResultStatus): ResultStatusSeverity {
    return status === 'Pass' ? 'success' : 'danger';
  }

  openCutOffDialog(): void {
    this.cutOffForm.reset({ cutOff: this.cutOff });
    this.showCutOffDialog = true;
  }

  onSaveCutOff(): void {
    if (this.cutOffForm.invalid) {
      this.cutOffForm.markAllAsTouched();
      return;
    }

    const raw = this.cutOffForm.getRawValue();
    this.cutOff = raw.cutOff!;
    this.results = this.results.map((result) => ({
      ...result,
      status: result.marks >= this.cutOff ? 'Pass' : 'Fail',
    }));

    this.messageService.add({
      severity: 'success',
      summary: 'Cut Off Saved',
      detail: `Cut off marks set to ${this.cutOff}%. Results were recalculated.`,
    });
    this.showCutOffDialog = false;
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
}
