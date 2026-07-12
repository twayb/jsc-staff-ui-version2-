import { Injectable, effect, signal } from '@angular/core';

export type LayoutMode = 'vertical' | 'horizontal';

const STORAGE_KEY = 'jsc-layout-mode';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  readonly mode = signal<LayoutMode>(this.getInitialMode());

  constructor() {
    effect(() => {
      localStorage.setItem(STORAGE_KEY, this.mode());
    });
  }

  setMode(mode: LayoutMode): void {
    this.mode.set(mode);
  }

  toggle(): void {
    this.mode.update((mode) => (mode === 'vertical' ? 'horizontal' : 'vertical'));
  }

  private getInitialMode(): LayoutMode {
    return localStorage.getItem(STORAGE_KEY) === 'horizontal' ? 'horizontal' : 'vertical';
  }
}
