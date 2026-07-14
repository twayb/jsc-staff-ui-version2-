import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Skeleton } from 'primeng/skeleton';
import { AppSkeleton } from '../../shared/app-skeleton/app-skeleton';

interface Stat {
  label: string;
  value: string;
  icon: string;
  bgClass: string;
  fgClass: string;
  route: string | null;
}

interface FunnelStage {
  label: string;
  value: number;
  color: string;
}

interface AdvertApplicantKpi {
  referenceNo: string;
  cadre: string;
  applicants: number;
}

interface PermitAdvertGroup {
  permitNo: string;
  permitName: string;
  closingDate: string;
  adverts: AdvertApplicantKpi[];
}

@Component({
  selector: 'app-recruitment-dashboard',
  imports: [RouterLink, NgClass, DecimalPipe, DatePipe, Skeleton, AppSkeleton],
  templateUrl: './recruitment-dashboard.html',
  styleUrl: './recruitment-dashboard.css',
})
export class RecruitmentDashboard implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly loadingDetails = signal(true);

  ngOnInit(): void {
    setTimeout(() => this.loading.set(false), 800);
    setTimeout(() => this.loadingDetails.set(false), 900);

    const handle = setInterval(() => this.simulateLiveApplication(), 4000);
    this.destroyRef.onDestroy(() => clearInterval(handle));
  }

  readonly pulsedReferenceNo = signal<string | null>(null);

  readonly openPermit = signal<PermitAdvertGroup>({
    permitNo: 'PR-2026-001',
    permitName: 'Permit July 2026',
    closingDate: '2026-08-15',
    adverts: [
      { referenceNo: 'ADV-2026-001', cadre: 'Afisa TEHAMA - Usimamizi wa Data za Kieletroniki (Database Administration) Daraja II', applicants: 128 },
      { referenceNo: 'ADV-2026-002', cadre: 'Afisa TEHAMA - Usalama wa Mifumo ya TEHAMA (ICT Security) Daraja II', applicants: 342 },
      { referenceNo: 'ADV-2026-003', cadre: ' Operata wa Kompyuta Msaidizi', applicants: 312 },
      { referenceNo: 'ADV-2026-004', cadre: ' Afisa Ugavi Msaidizi I Daraja II', applicants: 142 },
      { referenceNo: 'ADV-2026-005', cadre: ' Dereva Daraja II', applicants: 420 },
    ],
  });

  private simulateLiveApplication(): void {
    const adverts = this.openPermit().adverts;
    const advertIndex = Math.floor(Math.random() * adverts.length);
    const targetRef = adverts[advertIndex].referenceNo;

    this.openPermit.update((current) => ({
      ...current,
      adverts: current.adverts.map((advert, ai) =>
        ai === advertIndex ? { ...advert, applicants: advert.applicants + 1 } : advert,
      ),
    }));

    this.pulsedReferenceNo.set(targetRef);
    setTimeout(() => this.pulsedReferenceNo.set(null), 700);
  }

  readonly showTable = signal(false);
  readonly hoveredIndex = signal<number | null>(null);

  readonly selectedReferenceNo = signal<string | null>(null);

  readonly selectedAdvertLabel = computed(() => {
    const ref = this.selectedReferenceNo();
    if (!ref) return null;
    return this.openPermit().adverts.find((advert) => advert.referenceNo === ref)?.cadre ?? null;
  });

  private readonly funnelDataByAdvert: Record<string, FunnelStage[]> = {
    all: [
      { label: 'Applications', value: 1842, color: 'var(--funnel-1)' },
      { label: 'Longlisted', value: 612, color: 'var(--funnel-2)' },
      { label: 'Shortlisted', value: 268, color: 'var(--funnel-3)' },
      { label: 'Interviewed', value: 154, color: 'var(--funnel-4)' },
      { label: 'Selected', value: 47, color: 'var(--funnel-5)' },
    ],
    'ADV-2026-001': [
      { label: 'Applications', value: 128, color: 'var(--funnel-1)' },
      { label: 'Longlisted', value: 54, color: 'var(--funnel-2)' },
      { label: 'Shortlisted', value: 22, color: 'var(--funnel-3)' },
      { label: 'Interviewed', value: 12, color: 'var(--funnel-4)' },
      { label: 'Selected', value: 4, color: 'var(--funnel-5)' },
    ],
    'ADV-2026-002': [
      { label: 'Applications', value: 342, color: 'var(--funnel-1)' },
      { label: 'Longlisted', value: 140, color: 'var(--funnel-2)' },
      { label: 'Shortlisted', value: 58, color: 'var(--funnel-3)' },
      { label: 'Interviewed', value: 30, color: 'var(--funnel-4)' },
      { label: 'Selected', value: 9, color: 'var(--funnel-5)' },
    ],
    'ADV-2026-003': [
      { label: 'Applications', value: 312, color: 'var(--funnel-1)' },
      { label: 'Longlisted', value: 120, color: 'var(--funnel-2)' },
      { label: 'Shortlisted', value: 46, color: 'var(--funnel-3)' },
      { label: 'Interviewed', value: 24, color: 'var(--funnel-4)' },
      { label: 'Selected', value: 7, color: 'var(--funnel-5)' },
    ],
    'ADV-2026-004': [
      { label: 'Applications', value: 142, color: 'var(--funnel-1)' },
      { label: 'Longlisted', value: 58, color: 'var(--funnel-2)' },
      { label: 'Shortlisted', value: 24, color: 'var(--funnel-3)' },
      { label: 'Interviewed', value: 13, color: 'var(--funnel-4)' },
      { label: 'Selected', value: 5, color: 'var(--funnel-5)' },
    ],
    'ADV-2026-005': [
      { label: 'Applications', value: 420, color: 'var(--funnel-1)' },
      { label: 'Longlisted', value: 168, color: 'var(--funnel-2)' },
      { label: 'Shortlisted', value: 70, color: 'var(--funnel-3)' },
      { label: 'Interviewed', value: 38, color: 'var(--funnel-4)' },
      { label: 'Selected', value: 12, color: 'var(--funnel-5)' },
    ],
  };

  readonly funnelStages = computed<FunnelStage[]>(
    () => this.funnelDataByAdvert[this.selectedReferenceNo() ?? 'all'],
  );

  private readonly maxFunnelValue = computed(() => this.funnelStages()[0].value);

  selectAdvert(referenceNo: string): void {
    this.selectedReferenceNo.set(this.selectedReferenceNo() === referenceNo ? null : referenceNo);
  }

  widthPercent(value: number): number {
    return (value / this.maxFunnelValue()) * 100;
  }

  conversionRate(index: number): number {
    const stages = this.funnelStages();
    if (index === 0) return 100;
    return Math.round((stages[index].value / stages[index - 1].value) * 100);
  }

  readonly stats: Stat[] = [
    {
      label: 'Applications ',
      value: '0',
      icon: 'pi-inbox',
      bgClass: 'bg-primary/10',
      fgClass: 'text-primary',
      route: '/recruitment/applications',
    },
    {
      label: 'Available Vacancies',
      value: '0',
      icon: 'pi-briefcase',
      bgClass: 'bg-info-bg',
      fgClass: 'text-info',
      route: '/recruitment/adverts',
    },
    {
      label: 'New Permits',
      value: '0',
      icon: 'pi-id-card',
      bgClass: 'bg-success-bg',
      fgClass: 'text-success',
      route: '/recruitment/permits',
    },
    {
      label: 'Databank',
      value: '0',
      icon: 'pi-database',
      bgClass: 'bg-warning-bg',
      fgClass: 'text-warning',
      route: null,
    },
  ];
}
