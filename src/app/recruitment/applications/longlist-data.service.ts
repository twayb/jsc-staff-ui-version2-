import { Injectable, signal } from '@angular/core';

export type ApplicantStatus = 'Pending' | 'Shortlisted' | 'Not Shortlisted';

export interface EducationEntry {
  degree: string;
  startYear: number;
  endYear: number;
  college: string;
}

export interface RefereeEntry {
  name: string;
  position: string;
  phone: string;
  email: string;
}

export interface ProfessionalQualificationEntry {
  qualification: string;
  awardingBody: string;
  year: number;
}

export interface LonglistApplicant {
  nin: string;
  name: string;
  position: string;
  applicantId: string;
  applicationDate: string;
  status: ApplicantStatus;
  email: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  address: string;
  region: string;
  mobile: string;
  employmentStatus: string;
  education: EducationEntry[];
  professionalQualifications: ProfessionalQualificationEntry[];
  referees: RefereeEntry[];
  attachments: string[];
  remark?: string;
}

export const NOT_SHORTLIST_REASONS = [
  'Does not meet minimum qualification requirements',
  'Incomplete application documents',
  'Failed to meet age requirement',
  'Failed interview/assessment criteria',
  'Duplicate application',
  'Other',
];

export const REVERT_REASONS = [
  'Decision made in error',
  'Re-evaluation requested',
  'Additional documents submitted',
  'New information received',
  'Other',
];

const ATTACHMENTS = ['Curriculum Vitae.pdf', 'Academic Certificates.pdf', 'National ID.pdf', 'Cover Letter.pdf'];

@Injectable({ providedIn: 'root' })
export class LonglistDataService {
  private readonly _applicants = signal<LonglistApplicant[]>([
    {
      nin: '19990531111020000125',
      name: 'Amina Hassan',
      position: 'Magistrate',
      applicantId: 'APP-2026-00123',
      applicationDate: '2026-01-15',
      status: 'Pending',
      email: 'amina.hassan@example.com',
      gender: 'Female',
      dateOfBirth: '1994-05-31',
      maritalStatus: 'Married',
      address: 'Plot 12, Mikocheni',
      region: 'Mwanza',
      mobile: '+255 712 345 678',
      employmentStatus: 'Unemployed',
      education: [
        { degree: 'Bachelor of Laws (LLB)', startYear: 2013, endYear: 2016, college: 'University of Dar es Salaam' },
        {
          degree: 'Postgraduate Diploma in Legal Practice',
          startYear: 2017,
          endYear: 2017,
          college: 'Law School of Tanzania',
        },
      ],
      professionalQualifications: [
        { qualification: 'Advocate of the High Court of Tanzania', awardingBody: 'Tanganyika Law Society', year: 2017 },
        {
          qualification: 'Certificate in Alternative Dispute Resolution',
          awardingBody: 'Institute of Judicial Administration, Lushoto',
          year: 2019,
        },
      ],
      referees: [
        {
          name: 'Dr. Joseph Kimaro',
          position: 'Senior Lecturer, UDSM',
          phone: '+255 754 111 222',
          email: 'j.kimaro@udsm.ac.tz',
        },
        {
          name: 'Adv. Mary Lyimo',
          position: 'Advocate, High Court',
          phone: '+255 715 333 444',
          email: 'mary.lyimo@lawfirm.co.tz',
        },
      ],
      attachments: ATTACHMENTS,
    },
    {
      nin: '19900023456780000234',
      name: 'John Mwangi',
      position: 'Magistrate',
      applicantId: 'APP-2026-00124',
      applicationDate: '2026-01-16',
      status: 'Shortlisted',
      email: 'john.mwangi@example.com',
      gender: 'Male',
      dateOfBirth: '1990-02-14',
      maritalStatus: 'Single',
      address: 'Area C, Dodoma',
      region: 'Dodoma',
      mobile: '+255 713 456 789',
      employmentStatus: 'Employed',
      education: [
        { degree: 'Bachelor of Laws (LLB)', startYear: 2010, endYear: 2013, college: 'Mzumbe University' },
        {
          degree: 'Postgraduate Diploma in Legal Practice',
          startYear: 2014,
          endYear: 2014,
          college: 'Law School of Tanzania',
        },
      ],
      professionalQualifications: [
        { qualification: 'Advocate of the High Court of Tanzania', awardingBody: 'Tanganyika Law Society', year: 2014 },
        {
          qualification: 'Certificate in Case Management',
          awardingBody: 'Institute of Judicial Administration, Lushoto',
          year: 2016,
        },
      ],
      referees: [
        {
          name: 'Justice Peter Rugarabamu',
          position: 'Resident Magistrate',
          phone: '+255 756 222 333',
          email: 'p.rugarabamu@judiciary.go.tz',
        },
        {
          name: 'Adv. Neema Shirima',
          position: 'Advocate, High Court',
          phone: '+255 717 444 555',
          email: 'neema.shirima@lawfirm.co.tz',
        },
      ],
      attachments: ATTACHMENTS,
    },
    {
      nin: '19881034567890000345',
      name: 'Grace Kileo',
      position: 'Magistrate',
      applicantId: 'APP-2026-00125',
      applicationDate: '2026-01-18',
      status: 'Not Shortlisted',
      email: 'grace.kileo@example.com',
      gender: 'Female',
      dateOfBirth: '1988-10-03',
      maritalStatus: 'Married',
      address: 'Njiro, Arusha',
      region: 'Arusha',
      mobile: '+255 714 567 890',
      employmentStatus: 'Employed',
      education: [
        { degree: 'Bachelor of Laws (LLB)', startYear: 2008, endYear: 2011, college: 'Tumaini University Makumira' },
        {
          degree: 'Postgraduate Diploma in Legal Practice',
          startYear: 2012,
          endYear: 2012,
          college: 'Law School of Tanzania',
        },
      ],
      professionalQualifications: [
        { qualification: 'Advocate of the High Court of Tanzania', awardingBody: 'Tanganyika Law Society', year: 2012 },
        {
          qualification: 'Certificate in Judicial Ethics',
          awardingBody: 'Institute of Judicial Administration, Lushoto',
          year: 2015,
        },
      ],
      referees: [
        {
          name: 'Adv. Samuel Mrema',
          position: 'Senior Partner, Mrema & Co.',
          phone: '+255 755 666 777',
          email: 's.mrema@lawfirm.co.tz',
        },
        {
          name: 'Dr. Elizabeth Massawe',
          position: 'Lecturer, Tumaini University',
          phone: '+255 718 888 999',
          email: 'e.massawe@tumaini.ac.tz',
        },
      ],
      attachments: ATTACHMENTS,
    },
    {
      nin: '19921045678900000456',
      name: 'Peter Mushi',
      position: 'Magistrate',
      applicantId: 'APP-2026-00126',
      applicationDate: '2026-01-20',
      status: 'Pending',
      email: 'peter.mushi@example.com',
      gender: 'Male',
      dateOfBirth: '1992-07-22',
      maritalStatus: 'Single',
      address: 'Iyunga, Mbeya',
      region: 'Mbeya',
      mobile: '+255 719 012 345',
      employmentStatus: 'Unemployed',
      education: [
        { degree: 'Bachelor of Laws (LLB)', startYear: 2012, endYear: 2015, college: 'Ruaha Catholic University' },
        {
          degree: 'Postgraduate Diploma in Legal Practice',
          startYear: 2016,
          endYear: 2016,
          college: 'Law School of Tanzania',
        },
      ],
      professionalQualifications: [
        { qualification: 'Advocate of the High Court of Tanzania', awardingBody: 'Tanganyika Law Society', year: 2017 },
        {
          qualification: 'Certificate in Commercial Law Practice',
          awardingBody: 'Law School of Tanzania',
          year: 2019,
        },
      ],
      referees: [
        {
          name: 'Adv. Godfrey Mwakalinga',
          position: 'Advocate, Resident Magistrate Court',
          phone: '+255 752 123 456',
          email: 'g.mwakalinga@lawfirm.co.tz',
        },
        {
          name: 'Prof. Anna Mwakyusa',
          position: 'Dean of Law, Ruaha Catholic University',
          phone: '+255 716 234 567',
          email: 'a.mwakyusa@rucu.ac.tz',
        },
      ],
      attachments: ATTACHMENTS,
    },
    {
      nin: '19870056789010000567',
      name: 'Fatma Salim',
      position: 'Magistrate',
      applicantId: 'APP-2026-00127',
      applicationDate: '2026-01-22',
      status: 'Pending',
      email: 'fatma.salim@example.com',
      gender: 'Female',
      dateOfBirth: '1987-12-09',
      maritalStatus: 'Married',
      address: 'Michenzani, Zanzibar',
      region: 'Zanzibar',
      mobile: '+255 777 345 678',
      employmentStatus: 'Employed',
      education: [
        { degree: 'Bachelor of Laws (LLB)', startYear: 2007, endYear: 2010, college: 'State University of Zanzibar' },
        {
          degree: 'Postgraduate Diploma in Legal Practice',
          startYear: 2011,
          endYear: 2011,
          college: 'Law School of Tanzania',
        },
      ],
      professionalQualifications: [
        { qualification: 'Advocate of the High Court of Zanzibar', awardingBody: 'Zanzibar Law Society', year: 2012 },
        {
          qualification: 'Certificate in Islamic and Customary Law',
          awardingBody: 'State University of Zanzibar',
          year: 2014,
        },
      ],
      referees: [
        {
          name: 'Adv. Khamis Juma',
          position: 'Advocate, Zanzibar High Court',
          phone: '+255 777 456 789',
          email: 'khamis.juma@lawfirm.co.tz',
        },
        {
          name: 'Dr. Salma Ali',
          position: 'Lecturer, SUZA',
          phone: '+255 778 567 890',
          email: 's.ali@suza.ac.tz',
        },
      ],
      attachments: ATTACHMENTS,
    },
  ]);

  readonly applicants = this._applicants.asReadonly();

  getIndex(nin: string): number {
    return this._applicants().findIndex((applicant) => applicant.nin === nin);
  }

  setStatus(nin: string, status: ApplicantStatus): void {
    this._applicants.update((list) =>
      list.map((applicant) => (applicant.nin === nin ? { ...applicant, status, remark: undefined } : applicant)),
    );
  }

  setNotShortlisted(nin: string, reason: string): void {
    this._applicants.update((list) =>
      list.map((applicant) =>
        applicant.nin === nin ? { ...applicant, status: 'Not Shortlisted', remark: reason } : applicant,
      ),
    );
  }

  revertToPending(nin: string, reason: string): void {
    this._applicants.update((list) =>
      list.map((applicant) =>
        applicant.nin === nin ? { ...applicant, status: 'Pending', remark: reason } : applicant,
      ),
    );
  }
}
