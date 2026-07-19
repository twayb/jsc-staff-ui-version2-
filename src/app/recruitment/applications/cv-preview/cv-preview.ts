import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';
import { ApplicantPreviewApiService } from '../../../core/recruitment/applicant-preview-api.service';
import { ApplicantPreview as ApplicantPreviewData, mapApplicantPreview } from '../applicant-preview.model';

@Component({
  selector: 'app-cv-preview',
  imports: [RouterLink],
  templateUrl: './cv-preview.html',
  styleUrl: './cv-preview.css',
})
export class CvPreview {
  private readonly route = inject(ActivatedRoute);
  private readonly applicantPreviewApi = inject(ApplicantPreviewApiService);

  readonly advertId = this.route.snapshot.paramMap.get('advertId') ?? '';
  readonly origin = this.route.snapshot.paramMap.get('origin') === 'assigned' ? 'assigned' : 'longlist';
  readonly applicationId = this.route.snapshot.paramMap.get('applicationId') ?? '';

  readonly loading = signal(true);
  readonly applicant = signal<ApplicantPreviewData | null>(null);

  readonly workExperience = computed(() => this.applicant()?.workExperience ?? []);
  readonly languageProficiency = computed(() => this.applicant()?.languageProficiency ?? []);
  // Training/workshop history isn't present in the API sample we've seen (applicantTrainings was
  // empty) — kept empty here rather than guessing a shape.
  readonly trainingWorkshops: { title: string; organizer: string; year: number }[] = [];

  readonly initials = computed(() =>
    (this.applicant()?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
  );

  constructor() {
    this.loading.set(true);
    this.applicantPreviewApi
      .getApplication(this.applicationId)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          if (response.data) {
            this.applicant.set(mapApplicantPreview(response.data));
          }
        },
        error: () => {},
      });
  }

  onPrint(): void {
    window.print();
  }
}
