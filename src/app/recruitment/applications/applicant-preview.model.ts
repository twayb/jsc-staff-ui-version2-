import { titleCase } from '../../core/utils';
import { ApplicationDetailRecord } from '../../core/recruitment/applicant-preview-api.service';

export type ApplicantStatus = 'Pending' | 'Shortlisted' | 'Not Shortlisted';

export interface EducationEntry {
  degree: string;
  college: string;
  startYear: number;
  endYear: number;
}

export interface ProfessionalQualificationEntry {
  qualification: string;
  awardingBody: string;
  year: string;
}

export interface WorkExperienceEntry {
  position: string;
  employer: string;
  period: string;
}

export interface LanguageProficiencyEntry {
  language: string;
  level: string;
}

export interface RefereeEntry {
  name: string;
  position: string;
  phone: string;
  email: string;
}

export interface AttachmentEntry {
  label: string;
  fileId: string;
}

export interface ApplicantPreview {
  applicationId: string;
  applicantId: string;
  name: string;
  position: string;
  nin: string;
  email: string;
  gender: string;
  dateOfBirth: string;
  maritalStatus: string;
  address: string;
  region: string;
  mobile: string;
  employmentStatus: string;
  applicationDate: string;
  status: ApplicantStatus;
  education: EducationEntry[];
  professionalQualifications: ProfessionalQualificationEntry[];
  workExperience: WorkExperienceEntry[];
  languageProficiency: LanguageProficiencyEntry[];
  referees: RefereeEntry[];
  attachments: AttachmentEntry[];
}

function statusFromRecord(record: ApplicationDetailRecord): ApplicantStatus {
  if (record.shortlisted === 'SHORTLISTED') return 'Shortlisted';
  if (record.shortlisted === 'NOT_SHORTLISTED') return 'Not Shortlisted';
  return 'Pending';
}

export function mapApplicantPreview(record: ApplicationDetailRecord): ApplicantPreview {
  const applicant = record.applicant;

  const education: EducationEntry[] = applicant.applicantAcademic.map((entry) => ({
    degree: entry.course?.name ?? entry.level?.name ?? 'Unspecified',
    college: entry.institution?.name ?? entry.institutionName ?? 'Unspecified',
    startYear: entry.startYear,
    endYear: entry.endYear,
  }));

  const professionalQualifications: ProfessionalQualificationEntry[] = applicant.applicantProfessions.map((entry) => ({
    qualification: entry.profession?.name ?? entry.professionName ?? 'Unspecified',
    awardingBody: entry.institution?.name ?? entry.institutionName ?? 'Unspecified',
    year: entry.startDate?.slice(0, 4) ?? '',
  }));

  const workExperience: WorkExperienceEntry[] = applicant.applicantExperiences.map((entry) => ({
    position: entry.jobTitle,
    employer: entry.organisation,
    period: `${entry.startDate?.slice(0, 4) ?? ''} — ${entry.currentJob ? 'Present' : (entry.endDate?.slice(0, 4) ?? '')}`,
  }));

  const languageProficiency: LanguageProficiencyEntry[] = applicant.applicantLanguages.map((entry) => ({
    language: entry.language?.name ?? 'Unspecified',
    level: titleCase(entry.speak),
  }));

  const referees: RefereeEntry[] = applicant.applicantReferees.map((entry) => ({
    name: entry.name,
    position: entry.title,
    phone: entry.mobile,
    email: entry.email,
  }));

  const attachments: AttachmentEntry[] = [
    ...applicant.applicantAcademic.flatMap((entry) =>
      entry.documents.map((doc) => ({ label: titleCase(doc.documentType.replace(/_/g, ' ')), fileId: doc.fileId })),
    ),
    ...applicant.applicantOtherAttachments.map((doc) => ({
      label: titleCase(doc.documentType.replace(/_/g, ' ')),
      fileId: doc.fileId,
    })),
    ...(record.applicationLetter ? [{ label: 'Application Letter', fileId: record.applicationLetter }] : []),
    ...(record.employerLetter ? [{ label: 'Employer Letter', fileId: record.employerLetter }] : []),
  ];

  return {
    applicationId: record.id,
    applicantId: applicant.id,
    name: applicant.fullName,
    position: record.advert.name,
    nin: applicant.nin,
    email: applicant.email,
    gender: titleCase(applicant.gender),
    dateOfBirth: applicant.dateBirth,
    maritalStatus: titleCase(applicant.maritalStatus),
    address: applicant.address,
    region: applicant.regionOfBirth,
    mobile: applicant.mobile,
    employmentStatus: applicant.govEmployee ? 'Government Employee' : 'Not Employed',
    applicationDate: record.createdAt?.slice(0, 10) ?? '',
    status: statusFromRecord(record),
    education,
    professionalQualifications,
    workExperience,
    languageProficiency,
    referees,
    attachments,
  };
}
