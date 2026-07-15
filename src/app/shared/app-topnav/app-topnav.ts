import { AfterViewInit, Component, DestroyRef, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { NavItem, navItemsForUrl } from '../nav-items';

@Component({
  selector: 'app-topnav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './app-topnav.html',
})
export class AppTopNav implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('navScroll') navScrollRef?: ElementRef<HTMLElement>;

  readonly canScrollStart = signal(false);
  readonly canScrollEnd = signal(false);

  readonly navItems = toSignal(
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      map((event) => navItemsForUrl(event.urlAfterRedirects)),
      startWith(navItemsForUrl(this.router.url)),
    ),
    { initialValue: navItemsForUrl(this.router.url) },
  );

  readonly openLabel = signal<string | null>(null);
  readonly menuPosition = signal({ top: 0, left: 0 });

  isOpen(item: NavItem): boolean {
    return this.openLabel() === item.label;
  }

  toggle(item: NavItem, event: MouseEvent): void {
    if (this.isOpen(item)) {
      this.openLabel.set(null);
      return;
    }

    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    this.menuPosition.set({ top: rect.bottom + 4, left: rect.left });
    this.openLabel.set(item.label);
  }

  close(): void {
    this.openLabel.set(null);
  }

  private scrollRafId: number | null = null;

  ngAfterViewInit(): void {
    const onCheck = () => this.checkScroll();
    onCheck();

    const el = this.navScrollRef?.nativeElement;
    el?.addEventListener('scroll', onCheck);
    window.addEventListener('resize', onCheck);

    this.destroyRef.onDestroy(() => {
      el?.removeEventListener('scroll', onCheck);
      window.removeEventListener('resize', onCheck);
      this.stopScroll();
    });
  }

  private checkScroll(): void {
    const el = this.navScrollRef?.nativeElement;
    if (!el) return;
    this.canScrollStart.set(el.scrollLeft > 4);
    this.canScrollEnd.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }

  startScroll(direction: 'start' | 'end'): void {
    this.stopScroll();
    const step = () => {
      const el = this.navScrollRef?.nativeElement;
      if (!el) return;
      el.scrollLeft += direction === 'end' ? 6 : -6;
      this.scrollRafId = requestAnimationFrame(step);
    };
    this.scrollRafId = requestAnimationFrame(step);
  }

  stopScroll(): void {
    if (this.scrollRafId !== null) {
      cancelAnimationFrame(this.scrollRafId);
      this.scrollRafId = null;
    }
  }
}
