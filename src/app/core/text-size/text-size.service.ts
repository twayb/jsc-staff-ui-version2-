import { Injectable, effect, signal } from '@angular/core';

const STORAGE_KEY = 'jsc-content-text-scale';
const MIN_SCALE = 90;
const MAX_SCALE = 130;
const STEP = 10;
const DEFAULT_SCALE = 100;

@Injectable({ providedIn: 'root' })
export class TextSizeService {
  readonly scale = signal<number>(this.getInitialScale());

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, String(this.scale()));
    });
  }

  increase(): void {
    this.scale.update((value) => Math.min(MAX_SCALE, value + STEP));
  }

  decrease(): void {
    this.scale.update((value) => Math.max(MIN_SCALE, value - STEP));
  }

  reset(): void {
    this.scale.set(DEFAULT_SCALE);
  }

  canIncrease(): boolean {
    return this.scale() < MAX_SCALE;
  }

  canDecrease(): boolean {
    return this.scale() > MIN_SCALE;
  }

  canReset(): boolean {
    return this.scale() !== DEFAULT_SCALE;
  }

  private getInitialScale(): number {
    const stored = Number(localStorage.getItem(STORAGE_KEY));
    return stored >= MIN_SCALE && stored <= MAX_SCALE ? stored : DEFAULT_SCALE;
  }
}
