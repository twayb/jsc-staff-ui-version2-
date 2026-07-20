import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem, MessageService } from 'primeng/api';
import { finalize } from 'rxjs';
import { AppBreadcrumb } from '../../../shared/app-breadcrumb/app-breadcrumb';
import { AppDataTable } from '../../../shared/app-data-table/app-data-table';
import { AdvertApiService } from '../../../core/recruitment/advert-api.service';
import { InterviewVenueApiService, VenueApplicantRecord } from '../../../core/recruitment/interview-venue-api.service';

type Gender = 'Male' | 'Female';

interface Candidate {
  name: string;
  interviewNo: string;
  gender: Gender;
  phone: string;
}

function mapCandidate(record: VenueApplicantRecord): Candidate {
  return {
    name: record.applicantName,
    interviewNo: record.interviewNumber,
    gender: record.applicantGender?.toUpperCase() === 'FEMALE' ? 'Female' : 'Male',
    phone: record.applicantPhoneNumber,
  };
}

@Component({
  selector: 'app-candidate-by-venue',
  imports: [AppBreadcrumb, AppDataTable],
  templateUrl: './candidate-by-venue.html',
  styleUrl: './candidate-by-venue.css',
})
export class CandidateByVenue implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly messageService = inject(MessageService);
  private readonly advertApi = inject(AdvertApiService);
  private readonly interviewVenueApi = inject(InterviewVenueApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly region = this.route.snapshot.queryParamMap.get('region') ?? '';
  readonly venue = this.route.snapshot.queryParamMap.get('venue') ?? '';
  readonly venueId = this.route.snapshot.queryParamMap.get('venueId') ?? '';
  readonly interviewTypeId = this.route.snapshot.queryParamMap.get('interviewTypeId') ?? '';

  readonly breadcrumbItems = signal<MenuItem[]>([
    { label: 'Recruitment', routerLink: '/recruitment' },
    { label: 'Interview Management', routerLink: '/recruitment/interview-management' },
    { label: this.advertId, routerLink: `/recruitment/interview-management/${this.advertId}` },
    {
      label: 'Distribute by Region',
      routerLink: `/recruitment/interview-management/${this.advertId}/distribute-by-region/${this.interviewTypeId}`,
    },
    { label: this.venue },
  ]);

  readonly loading = signal(true);
  readonly candidates = signal<Candidate[]>([]);

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
    this.interviewVenueApi
      .getApplicantsByVenue({
        advertId: this.advertId,
        interviewTypeId: this.interviewTypeId,
        venueId: this.venueId,
      })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          this.candidates.set((response.data ?? []).map(mapCandidate));
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Failed to Load Candidates',
            detail: 'Could not load the candidates for this venue. Please try again later.',
          });
        },
      });
  }

  onExport(): void {
    const header = ['No', 'Name', 'Interview No', 'Gender', 'Phone'];
    const rows = this.candidates().map((candidate, index) => [
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
