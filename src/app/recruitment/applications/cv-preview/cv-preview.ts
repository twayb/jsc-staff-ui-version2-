import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LonglistDataService } from '../longlist-data.service';

interface WorkExperience {
  position: string;
  employer: string;
  period: string;
}

interface LanguageProficiency {
  language: string;
  level: string;
}

interface TrainingWorkshop {
  title: string;
  organizer: string;
  year: number;
}

@Component({
  selector: 'app-cv-preview',
  imports: [RouterLink],
  templateUrl: './cv-preview.html',
  styleUrl: './cv-preview.css',
})
export class CvPreview {
  private readonly route = inject(ActivatedRoute);
  private readonly longlistData = inject(LonglistDataService);

  readonly referenceNo = this.route.snapshot.paramMap.get('referenceNo') ?? '';
  readonly origin = this.route.snapshot.paramMap.get('origin') === 'assigned' ? 'assigned' : 'longlist';
  readonly nin = this.route.snapshot.paramMap.get('nin') ?? '';

  readonly applicant = computed(() => this.longlistData.applicants().find((a) => a.nin === this.nin));

  readonly initials = computed(() =>
    (this.applicant()?.name ?? '')
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join(''),
  );

  readonly workExperience: WorkExperience[] = [
    { position: 'State Attorney', employer: 'Office of the Director of Public Prosecutions', period: '2018 — 2022' },
    { position: 'Legal Officer', employer: 'Ministry of Constitutional and Legal Affairs', period: '2016 — 2018' },
  ];

  readonly languageProficiency: LanguageProficiency[] = [
    { language: 'Kiswahili', level: 'Native' },
    { language: 'English', level: 'Fluent' },
    { language: 'French', level: 'Basic' },
  ];

  readonly trainingWorkshops: TrainingWorkshop[] = [
    { title: 'Judicial Ethics and Conduct', organizer: 'Institute of Judicial Administration, Lushoto', year: 2023 },
    { title: 'Case Management and Court Technology', organizer: 'Judiciary of Tanzania', year: 2022 },
    { title: 'Human Rights and Access to Justice', organizer: 'Tanzania Human Rights Defenders Coalition', year: 2021 },
  ];

  onPrint(): void {
    window.print();
  }
}
