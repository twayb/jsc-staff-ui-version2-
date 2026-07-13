import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';

type Gender = 'Male' | 'Female';

interface Candidate {
  name: string;
  interviewNo: string;
  gender: Gender;
  phone: string;
}

@Component({
  selector: 'app-candidate-by-venue',
  imports: [AppBreadcrumb, AppDataTable],
  templateUrl: './candidate-by-venue.html',
  styleUrl: './candidate-by-venue.css',
})
export class CandidateByVenue implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly permitNo = this.route.snapshot.paramMap.get('permitNo') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly venue = this.route.snapshot.queryParamMap.get('venue') ?? '';

  readonly breadcrumbItems: MenuItem[] = [
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.permitNo, routerLink: `/recruitment/interview-management/${this.permitNo}` },
    {
      label: 'Distribute by Region',
      routerLink: `/recruitment/interview-management/${this.permitNo}/distribute-by-region`,
    },
    { label: this.venue },
  ];

  readonly loading = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
  }

  candidates: Candidate[] = [
    { name: 'John Mwangi', interviewNo: 'INT-2026-001', gender: 'Male', phone: '0754123456' },
    { name: 'Amina Hassan', interviewNo: 'INT-2026-002', gender: 'Female', phone: '0765234567' },
    { name: 'Fatma Salim', interviewNo: 'INT-2026-003', gender: 'Female', phone: '0713345678' },
    { name: 'Juma Kessy', interviewNo: 'INT-2026-004', gender: 'Male', phone: '0788456789' },
  ];

  onExport(): void {
    const header = ['No', 'Name', 'Interview No', 'Gender', 'Phone'];
    const rows = this.candidates.map((candidate, index) => [
      String(index + 1),
      candidate.name,
      candidate.interviewNo,
      candidate.gender,
      candidate.phone,
    ]);

    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `candidates-${this.venue || 'venue'}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}
