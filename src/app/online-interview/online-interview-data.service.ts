import { Injectable } from '@angular/core';

export type InterviewSetStatus = 'Draft' | 'Scheduled' | 'Ongoing' | 'Completed' | 'Cancelled';
export type CandidateSessionStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Graded';
export type InterviewCategoryType = 'General' | 'Profession';
export type InterviewCategoryStatus = 'Active' | 'Inactive';

export type QuestionSelectionMode = 'Random' | 'Manual';
export type InterviewTypeSeverity = 'info' | 'success' | 'warn' | 'secondary' | 'danger';
export type InterviewSetStatusSeverity = 'secondary' | 'info' | 'warn' | 'success' | 'danger';

export interface InterviewSet {
  id: string;
  title: string;
  cadre: string;
  category: string;
  interviewType: string;
  selectionMode: QuestionSelectionMode;
  showResults: boolean;
  questionIds: string[];
  questionCount: number;
  duration: number;
  passMark: number;
  scheduledDate: string;
  scheduledTime: string;
  endDate: string;
  endTime: string;
  candidatesInvited: number;
  status: InterviewSetStatus;
}

export interface CandidateSession {
  id: string;
  candidateName: string;
  nin: string;
  interviewTitle: string;
  startedAt: string | null;
  submittedAt: string | null;
  durationTaken: number | null;
  score: number | null;
  status: CandidateSessionStatus;
}

export interface InterviewCategoryItem {
  category: InterviewCategoryType;
  status: InterviewCategoryStatus;
}

export interface InterviewTypeItem {
  name: string;
}

export interface AdvertOption {
  referenceNo: string;
  cadre: string;
  posts: number;
}

export type QuestionLevel = 'Easy' | 'Medium' | 'Hard';

export interface InterviewQuestionItem {
  id: string;
  text: string;
  cadre: string;
  category: string;
  level: QuestionLevel;
}

export interface RegionSession {
  region: string;
  status: InterviewSetStatus;
  venues: number;
  totalCandidates: number;
  submitted: number;
}

export interface VenueSession {
  venue: string;
  totalApplicants: number;
  inProgress: number;
  finished: number;
}

export interface SessionByVenueItem {
  session: string;
  total: number;
  notStarted: number;
  inProgress: number;
}

export type CandidateVenueSessionStatus = 'Not Started' | 'Started' | 'Finished' | 'Ended';

export interface CandidateVenueSession {
  candidateName: string;
  questionsAnswered: number;
  totalQuestions: number;
  fullscreenExits: number;
  timeSpentMinutes: number;
  status: CandidateVenueSessionStatus;
}

export interface CategoryLevelAvailability {
  category: string;
  levels: Record<QuestionLevel, number>;
}

const INTERVIEW_SETS: InterviewSet[] = [
  {
    id: 'OI-2026-001',
    title: 'ICT Officer Aptitude Test - Round 1',
    cadre: 'ICT Officer',
    category: 'Technical',
    interviewType: 'Aptitude Test',
    selectionMode: 'Random',
    showResults: true,
    questionIds: [
      'Q-001',
      'Q-002',
      'Q-003',
      'Q-004',
      'Q-016',
      'Q-022',
      'Q-023',
      'Q-024',
      'Q-025',
      'Q-026',
      'Q-027',
      'Q-028',
      'Q-029',
      'Q-030',
      'Q-031',
      'Q-032',
      'Q-033',
      'Q-034',
      'Q-035',
      'Q-036',
      'Q-037',
      'Q-038',
      'Q-039',
      'Q-040',
      'Q-041',
      'Q-042',
      'Q-043',
      'Q-044',
      'Q-045',
      'Q-046',
    ],
    questionCount: 30,
    duration: 45,
    passMark: 60,
    scheduledDate: '2026-07-22',
    scheduledTime: '09:00',
    endDate: '2026-07-22',
    endTime: '09:45',
    candidatesInvited: 24,
    status: 'Scheduled',
  },
  {
    id: 'OI-2026-002',
    title: 'Magistrate Legal Knowledge Test',
    cadre: 'Magistrate',
    category: 'Legal Knowledge',
    interviewType: 'Written Test',
    selectionMode: 'Manual',
    showResults: true,
    questionIds: ['Q-005', 'Q-006', 'Q-007'],
    questionCount: 40,
    duration: 60,
    passMark: 70,
    scheduledDate: '2026-07-25',
    scheduledTime: '10:30',
    endDate: '2026-07-25',
    endTime: '11:30',
    candidatesInvited: 12,
    status: 'Scheduled',
  },
  {
    id: 'OI-2026-003',
    title: 'Court Clerk General Knowledge Screening',
    cadre: 'Court Clerk',
    category: 'General Knowledge',
    interviewType: 'Oral Interview',
    selectionMode: 'Random',
    showResults: false,
    questionIds: ['Q-010', 'Q-011'],
    questionCount: 25,
    duration: 30,
    passMark: 50,
    scheduledDate: '2026-07-10',
    scheduledTime: '08:00',
    endDate: '2026-07-10',
    endTime: '08:30',
    candidatesInvited: 36,
    status: 'Completed',
  },
  {
    id: 'OI-2026-004',
    title: 'HR Officer Situational Judgment Test',
    cadre: 'HR Officer',
    category: 'Situational Judgment',
    interviewType: 'Panel Interview',
    selectionMode: 'Manual',
    showResults: true,
    questionIds: ['Q-012', 'Q-013'],
    questionCount: 20,
    duration: 25,
    passMark: 55,
    scheduledDate: '2026-08-05',
    scheduledTime: '13:00',
    endDate: '2026-08-05',
    endTime: '13:25',
    candidatesInvited: 15,
    status: 'Draft',
  },
];

const CANDIDATE_SESSIONS: CandidateSession[] = [
  {
    id: 'SESS-001',
    candidateName: 'Amina Hassan Juma',
    nin: '19850312-12345-00001-23',
    interviewTitle: 'Court Clerk General Knowledge Screening',
    startedAt: '2026-07-10 08:02',
    submittedAt: '2026-07-10 08:29',
    durationTaken: 27,
    score: 78,
    status: 'Graded',
  },
  {
    id: 'SESS-002',
    candidateName: 'Baraka Emmanuel Mushi',
    nin: '19900721-54321-00002-45',
    interviewTitle: 'Court Clerk General Knowledge Screening',
    startedAt: '2026-07-10 08:01',
    submittedAt: '2026-07-10 08:31',
    durationTaken: 30,
    score: 52,
    status: 'Graded',
  },
  {
    id: 'SESS-003',
    candidateName: 'Zainab Omary Kileo',
    nin: '19921105-67890-00003-67',
    interviewTitle: 'ICT Officer Aptitude Test - Round 1',
    startedAt: '2026-07-22 09:03',
    submittedAt: null,
    durationTaken: null,
    score: null,
    status: 'In Progress',
  },
  {
    id: 'SESS-004',
    candidateName: 'Daniel Peter Mwakalinga',
    nin: '19881018-11223-00004-89',
    interviewTitle: 'ICT Officer Aptitude Test - Round 1',
    startedAt: null,
    submittedAt: null,
    durationTaken: null,
    score: null,
    status: 'Not Started',
  },
  {
    id: 'SESS-005',
    candidateName: 'Grace William Lyimo',
    nin: '19950227-33445-00005-12',
    interviewTitle: 'Magistrate Legal Knowledge Test',
    startedAt: null,
    submittedAt: null,
    durationTaken: null,
    score: null,
    status: 'Not Started',
  },
];

const INTERVIEW_CATEGORIES: InterviewCategoryItem[] = [
  { category: 'General', status: 'Active' },
  { category: 'Profession', status: 'Active' },
];

const REGION_SESSIONS: RegionSession[] = [
  { region: 'Dar es Salaam', status: 'Ongoing', venues: 5, totalCandidates: 240, submitted: 180 },
  { region: 'Arusha', status: 'Scheduled', venues: 3, totalCandidates: 90, submitted: 0 },
  { region: 'Mwanza', status: 'Ongoing', venues: 4, totalCandidates: 150, submitted: 95 },
  { region: 'Dodoma', status: 'Completed', venues: 2, totalCandidates: 60, submitted: 60 },
  { region: 'Mbeya', status: 'Scheduled', venues: 2, totalCandidates: 50, submitted: 0 },
  { region: 'Zanzibar', status: 'Completed', venues: 3, totalCandidates: 80, submitted: 80 },
  { region: 'Tanga', status: 'Ongoing', venues: 2, totalCandidates: 70, submitted: 40 },
];

const VENUE_SESSIONS: VenueSession[] = [
  { venue: 'University of Dar es Salaam', totalApplicants: 70, inProgress: 10, finished: 55 },
  { venue: 'Dar es Salaam Institute of Technology', totalApplicants: 50, inProgress: 8, finished: 40 },
  { venue: 'Ardhi University', totalApplicants: 45, inProgress: 5, finished: 35 },
  { venue: 'Mzumbe University Dar Campus', totalApplicants: 40, inProgress: 6, finished: 28 },
  { venue: 'Kibaha Education Centre', totalApplicants: 35, inProgress: 4, finished: 22 },
];

const SESSION_BY_VENUE: SessionByVenueItem[] = [
  { session: 'Session A - Morning', total: 25, notStarted: 1, inProgress: 4 },
  { session: 'Session B - Midday', total: 25, notStarted: 1, inProgress: 4 },
  { session: 'Session C - Afternoon', total: 20, notStarted: 3, inProgress: 2 },
];

const CANDIDATE_VENUE_SESSIONS: CandidateVenueSession[] = [
  {
    candidateName: 'Amina Hassan Juma',
    questionsAnswered: 25,
    totalQuestions: 25,
    fullscreenExits: 0,
    timeSpentMinutes: 42,
    status: 'Finished',
  },
  {
    candidateName: 'Baraka Emmanuel Mushi',
    questionsAnswered: 25,
    totalQuestions: 25,
    fullscreenExits: 2,
    timeSpentMinutes: 45,
    status: 'Finished',
  },
  {
    candidateName: 'Zainab Omary Kileo',
    questionsAnswered: 18,
    totalQuestions: 25,
    fullscreenExits: 1,
    timeSpentMinutes: 30,
    status: 'Started',
  },
  {
    candidateName: 'Daniel Peter Mwakalinga',
    questionsAnswered: 9,
    totalQuestions: 25,
    fullscreenExits: 3,
    timeSpentMinutes: 20,
    status: 'Started',
  },
  {
    candidateName: 'Grace William Lyimo',
    questionsAnswered: 0,
    totalQuestions: 25,
    fullscreenExits: 0,
    timeSpentMinutes: 0,
    status: 'Not Started',
  },
  {
    candidateName: 'Hassan Juma Mtenga',
    questionsAnswered: 25,
    totalQuestions: 25,
    fullscreenExits: 0,
    timeSpentMinutes: 38,
    status: 'Finished',
  },
  {
    candidateName: 'Fatuma Rashid Kombo',
    questionsAnswered: 14,
    totalQuestions: 25,
    fullscreenExits: 1,
    timeSpentMinutes: 27,
    status: 'Started',
  },
  {
    candidateName: 'Peter John Mnyika',
    questionsAnswered: 0,
    totalQuestions: 25,
    fullscreenExits: 0,
    timeSpentMinutes: 0,
    status: 'Not Started',
  },
];

const INTERVIEW_TYPES: InterviewTypeItem[] = [
  { name: 'Aptitude Test' },
  { name: 'Oral Interview' },
  { name: 'Written Test' },
  { name: 'Practical Assessment' },
  { name: 'Panel Interview' },
];

const ADVERT_OPTIONS: AdvertOption[] = [
  { referenceNo: 'ADV-2026-001', cadre: 'Magistrate', posts: 5 },
  { referenceNo: 'ADV-2026-002', cadre: 'Legal Officer', posts: 3 },
  { referenceNo: 'ADV-2026-003', cadre: 'Court Clerk', posts: 8 },
  { referenceNo: 'ADV-2026-004', cadre: 'ICT Officer', posts: 4 },
  { referenceNo: 'ADV-2026-005', cadre: 'HR Officer', posts: 2 },
  { referenceNo: 'ADV-2026-006', cadre: 'Court Administrator', posts: 3 },
];

const CADRE_CATEGORY_MAP: Record<string, string> = {
  Magistrate: 'Legal Knowledge',
  'Legal Officer': 'Legal Knowledge',
  'Court Clerk': 'General Knowledge',
  'ICT Officer': 'Technical',
  'HR Officer': 'Behavioral',
  'Court Administrator': 'Situational Judgment',
};

const INTERVIEW_TYPE_SEVERITIES: Record<string, InterviewTypeSeverity> = {
  'Aptitude Test': 'info',
  'Oral Interview': 'success',
  'Written Test': 'warn',
  'Practical Assessment': 'secondary',
  'Panel Interview': 'danger',
};

const QUESTION_POOL: InterviewQuestionItem[] = [
  {
    id: 'Q-001',
    text: 'Explain the OSI model and its seven layers.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-002',
    text: 'What is the difference between symmetric and asymmetric encryption?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-003',
    text: 'Describe how a firewall protects a network from unauthorized access.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Easy',
  },
  {
    id: 'Q-004',
    text: 'What steps would you take to recover a corrupted database?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-016',
    text: 'What is the purpose of a load balancer in a web architecture?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-022',
    text: 'What is the difference between TCP and UDP?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Easy',
  },
  {
    id: 'Q-023',
    text: 'Explain what DNS does and why it is needed.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Easy',
  },
  {
    id: 'Q-024',
    text: 'What is a VPN and how does it secure remote access?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Easy',
  },
  {
    id: 'Q-025',
    text: 'Describe the purpose of a subnet mask in IP networking.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Easy',
  },
  {
    id: 'Q-026',
    text: 'What is the difference between a hub, a switch, and a router?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Easy',
  },
  {
    id: 'Q-027',
    text: 'What is RAID and why is it used in storage systems?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-028',
    text: 'Explain the difference between a stateful and stateless firewall.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-029',
    text: 'What is the purpose of an SLA in IT service management?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-030',
    text: 'How does DHCP simplify IP address management on a network?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-031',
    text: 'What is the role of an Active Directory domain controller?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-032',
    text: 'Describe the difference between full, incremental, and differential backups.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-033',
    text: 'What is a man-in-the-middle attack and how can it be prevented?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-034',
    text: 'Explain how a reverse proxy differs from a forward proxy.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-035',
    text: 'What are the main principles of the CIA triad in information security?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Medium',
  },
  {
    id: 'Q-036',
    text: 'How would you troubleshoot a server that is intermittently unreachable on the network?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-037',
    text: 'Explain how you would design a disaster recovery plan for a government data center.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-038',
    text: 'What are the trade-offs between on-premise and cloud-hosted infrastructure?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-039',
    text: 'Describe how you would harden a public-facing web server against attacks.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-040',
    text: 'How does a public key infrastructure (PKI) establish trust between parties?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-041',
    text: 'Explain how you would investigate a suspected data breach on a shared file server.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-042',
    text: 'What considerations go into planning a zero-downtime system migration?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-043',
    text: 'How would you design network segmentation for a multi-department office?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-044',
    text: 'Describe the steps you would take to recover from a ransomware incident.',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-045',
    text: 'What monitoring and alerting strategy would you set up for critical production servers?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-046',
    text: 'How would you evaluate and prioritize a backlog of ICT support tickets?',
    cadre: 'ICT Officer',
    category: 'Technical',
    level: 'Hard',
  },
  {
    id: 'Q-005',
    text: 'Explain the doctrine of stare decisis and its importance in judicial rulings.',
    cadre: 'Magistrate',
    category: 'Legal Knowledge',
    level: 'Hard',
  },
  {
    id: 'Q-006',
    text: 'What is the difference between civil and criminal jurisdiction?',
    cadre: 'Magistrate',
    category: 'Legal Knowledge',
    level: 'Easy',
  },
  {
    id: 'Q-007',
    text: 'Describe the procedure for issuing a search warrant.',
    cadre: 'Magistrate',
    category: 'Legal Knowledge',
    level: 'Medium',
  },
  {
    id: 'Q-017',
    text: "What is meant by 'burden of proof' in criminal proceedings?",
    cadre: 'Magistrate',
    category: 'Legal Knowledge',
    level: 'Easy',
  },
  {
    id: 'Q-008',
    text: 'Outline the key elements of a valid contract.',
    cadre: 'Legal Officer',
    category: 'Legal Knowledge',
    level: 'Easy',
  },
  {
    id: 'Q-009',
    text: 'Explain the concept of natural justice in administrative law.',
    cadre: 'Legal Officer',
    category: 'Legal Knowledge',
    level: 'Medium',
  },
  {
    id: 'Q-018',
    text: 'Explain the difference between void and voidable contracts.',
    cadre: 'Legal Officer',
    category: 'Legal Knowledge',
    level: 'Hard',
  },
  {
    id: 'Q-010',
    text: 'What are the key responsibilities of a court clerk during a hearing?',
    cadre: 'Court Clerk',
    category: 'General Knowledge',
    level: 'Easy',
  },
  {
    id: 'Q-011',
    text: 'Describe the process for filing a case in the court registry.',
    cadre: 'Court Clerk',
    category: 'General Knowledge',
    level: 'Medium',
  },
  {
    id: 'Q-019',
    text: 'How should a court clerk handle confidential case files?',
    cadre: 'Court Clerk',
    category: 'General Knowledge',
    level: 'Hard',
  },
  {
    id: 'Q-012',
    text: 'Describe a time you resolved a conflict between two employees.',
    cadre: 'HR Officer',
    category: 'Behavioral',
    level: 'Medium',
  },
  {
    id: 'Q-013',
    text: 'How do you approach performance appraisal for underperforming staff?',
    cadre: 'HR Officer',
    category: 'Behavioral',
    level: 'Hard',
  },
  {
    id: 'Q-020',
    text: 'What would you do if a new employee is struggling to adapt to the team?',
    cadre: 'HR Officer',
    category: 'Behavioral',
    level: 'Easy',
  },
  {
    id: 'Q-014',
    text: 'How would you handle a sudden shortage of courtroom staff on a hearing day?',
    cadre: 'Court Administrator',
    category: 'Situational Judgment',
    level: 'Medium',
  },
  {
    id: 'Q-015',
    text: 'Describe how you would prioritize competing administrative demands during a court session.',
    cadre: 'Court Administrator',
    category: 'Situational Judgment',
    level: 'Hard',
  },
  {
    id: 'Q-021',
    text: 'How would you manage a scheduling conflict between two panels sharing a courtroom?',
    cadre: 'Court Administrator',
    category: 'Situational Judgment',
    level: 'Easy',
  },
];

@Injectable({ providedIn: 'root' })
export class OnlineInterviewDataService {
  interviewSets: InterviewSet[] = INTERVIEW_SETS;
  candidateSessions: CandidateSession[] = CANDIDATE_SESSIONS;
  interviewCategories: InterviewCategoryItem[] = INTERVIEW_CATEGORIES;
  interviewTypes: InterviewTypeItem[] = INTERVIEW_TYPES;
  advertOptions: AdvertOption[] = ADVERT_OPTIONS;
  questionPool: InterviewQuestionItem[] = QUESTION_POOL;
  regionSessions: RegionSession[] = REGION_SESSIONS;
  venueSessions: VenueSession[] = VENUE_SESSIONS;
  sessionsByVenue: SessionByVenueItem[] = SESSION_BY_VENUE;
  candidateVenueSessions: CandidateVenueSession[] = CANDIDATE_VENUE_SESSIONS;

  findAdvert(referenceNo: string): AdvertOption | undefined {
    return this.advertOptions.find((advert) => advert.referenceNo === referenceNo);
  }

  categoryForCadre(cadre: string): string {
    return CADRE_CATEGORY_MAP[cadre] ?? 'General Knowledge';
  }

  getQuestionsForCadre(cadre: string): InterviewQuestionItem[] {
    return this.questionPool.filter((question) => question.cadre === cadre);
  }

  getQuestionsByIds(ids: string[]): InterviewQuestionItem[] {
    return ids
      .map((id) => this.questionPool.find((question) => question.id === id))
      .filter((question): question is InterviewQuestionItem => !!question);
  }

  interviewTypeSeverity(interviewType: string): InterviewTypeSeverity {
    return INTERVIEW_TYPE_SEVERITIES[interviewType] ?? 'secondary';
  }

  interviewStatusSeverity(status: InterviewSetStatus): InterviewSetStatusSeverity {
    switch (status) {
      case 'Draft':
        return 'secondary';
      case 'Scheduled':
        return 'info';
      case 'Ongoing':
        return 'warn';
      case 'Completed':
        return 'success';
      case 'Cancelled':
        return 'danger';
    }
  }

  getCategoryAvailability(cadre: string): CategoryLevelAvailability[] {
    const questions = this.getQuestionsForCadre(cadre);
    if (questions.length === 0) {
      return [];
    }

    const levels: Record<QuestionLevel, number> = { Easy: 0, Medium: 0, Hard: 0 };
    for (const question of questions) {
      levels[question.level]++;
    }

    return [{ category: this.categoryForCadre(cadre), levels }];
  }

  get totalInterviews(): number {
    return this.interviewSets.length;
  }

  get totalSessions(): number {
    return this.candidateSessions.length;
  }

  get completedSessions(): number {
    return this.candidateSessions.filter((session) => session.status === 'Graded').length;
  }

  get pendingSessions(): number {
    return this.candidateSessions.filter(
      (session) => session.status === 'Not Started' || session.status === 'In Progress',
    ).length;
  }

  get upcomingInterviews(): InterviewSet[] {
    return [...this.interviewSets]
      .filter((interview) => interview.status === 'Scheduled')
      .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
      .slice(0, 6);
  }
}
