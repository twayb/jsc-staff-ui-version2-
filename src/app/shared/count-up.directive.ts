import { Directive, ElementRef, Input, OnChanges, OnDestroy, SimpleChanges, inject } from '@angular/core';

@Directive({
  selector: '[appCountUp]',
})
export class CountUp implements OnChanges, OnDestroy {
  @Input('appCountUp') target = 0;
  @Input() countUpDuration = 800;

  private readonly el = inject(ElementRef<HTMLElement>);
  private frame: number | null = null;

  ngOnChanges(changes: SimpleChanges): void {
    if (!('target' in changes)) {
      return;
    }
    const from = changes['target'].previousValue ?? 0;
    this.animate(typeof from === 'number' ? from : 0, this.target);
  }

  ngOnDestroy(): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }
  }

  private animate(from: number, to: number): void {
    if (this.frame !== null) {
      cancelAnimationFrame(this.frame);
    }

    if (from === to) {
      this.el.nativeElement.textContent = to.toLocaleString();
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min((now - start) / this.countUpDuration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(from + (to - from) * eased);
      this.el.nativeElement.textContent = current.toLocaleString();

      if (progress < 1) {
        this.frame = requestAnimationFrame(step);
      } else {
        this.frame = null;
      }
    };

    this.frame = requestAnimationFrame(step);
  }
}
