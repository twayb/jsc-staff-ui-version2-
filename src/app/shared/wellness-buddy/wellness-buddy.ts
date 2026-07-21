import { Component, DestroyRef, OnInit, inject, input, signal } from '@angular/core';

export interface WellnessMessage {
  emoji: string;
  eyebrow: string;
  text: string;
}

export const DEFAULT_WELLNESS_MESSAGES: WellnessMessage[] = [
  { emoji: '🧍', eyebrow: 'Move a little', text: "You've been sitting a while — stretch your legs for a minute." },
  { emoji: '💧', eyebrow: 'Hydration check', text: 'Stay hydrated — grab a glass of water.' },
  { emoji: '👀', eyebrow: 'Eye rest', text: 'Look at something 20 feet away for 20 seconds.' },
  { emoji: '🌬️', eyebrow: 'Breathe', text: 'Take a slow, deep breath. In for four, out for four.' },
  { emoji: '🪑', eyebrow: 'Posture', text: 'Check your posture — shoulders back, feet flat.' },
  { emoji: '🚶', eyebrow: 'Step away', text: 'Short walk? Even a lap round the room helps.' },
];

const GREETING: WellnessMessage = {
  emoji: '👋',
  eyebrow: 'Hello there',
  text: "Hi! I'm your Wellness Buddy.",
};

type BuddyState = 'hidden' | 'enter' | 'leave';

@Component({
  selector: 'app-wellness-buddy',
  templateUrl: './wellness-buddy.html',
  styleUrl: './wellness-buddy.css',
})
export class WellnessBuddy implements OnInit {
  /** How long the one-time greeting shows before handing off to the first real message. */
  readonly greetingMs = input<number>(4400);

  /** Message set to cycle through. Defaults to a general sitting/hydration/eye-rest rotation. */
  readonly messages = input<WellnessMessage[]>(DEFAULT_WELLNESS_MESSAGES);

  /** How often the reminder auto-fires. Standard is 30 minutes for movement/hydration nudges. */
  readonly intervalMs = input<number>(30 * 60 * 1000);

  /** How long the bubble stays on screen before it slides back out. */
  readonly visibleMs = input<number>(8000);

  /** Whether the auto-reminder timer starts immediately. */
  readonly autoStart = input<boolean>(true);



  readonly state = signal<BuddyState>('hidden');
  readonly popping = signal(false);
  readonly greeting = signal(false);
  readonly greetingMessage = GREETING;
  readonly current = signal<WellnessMessage>(DEFAULT_WELLNESS_MESSAGES[0]);

  private index = 0;
  private hasGreeted = false;
  private hideTimer?: ReturnType<typeof setTimeout>;
  private popTimer?: ReturnType<typeof setTimeout>;
  private greetTimer?: ReturnType<typeof setTimeout>;
  private autoTimer?: ReturnType<typeof setInterval>;
  private autoOn = true;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      clearTimeout(this.hideTimer);
      clearTimeout(this.popTimer);
      clearTimeout(this.greetTimer);
      clearInterval(this.autoTimer);
    });
  }

  ngOnInit(): void {
    if (this.autoStart()) {
      this.scheduleAuto();
    }
  }

  /** Show the next message. Safe to call manually (e.g. from a bell icon) as well as on a timer. */
  trigger(): void {
    clearTimeout(this.hideTimer);
    clearTimeout(this.greetTimer);

    const list = this.messages();
    const message = list[this.index % list.length];
    this.index++;

    if (!this.hasGreeted) {
      this.hasGreeted = true;
      this.greeting.set(true);
      this.current.set(message);
      this.state.set('enter');

      this.greetTimer = setTimeout(() => {
        this.greeting.set(false);
        this.bump();
        this.hideTimer = setTimeout(() => this.hide(), this.visibleMs());
      }, this.greetingMs());
      return;
    }

    this.current.set(message);

    if (this.state() === 'enter') {
      // Already on screen — just bounce the emoji to flag a new message
      // rather than re-running the whole slide-in.
      this.bump();
    } else {
      this.state.set('enter');
    }

    this.hideTimer = setTimeout(() => this.hide(), this.visibleMs());
  }

  /** Slide the widget back out. Called automatically, or wire to a dismiss (✕) button. */
  hide(): void {
    clearTimeout(this.hideTimer);
    if (this.state() !== 'enter') return;
    this.state.set('leave');
  }

  /** Bound to (animationend) on the root element so it fully leaves the DOM after sliding out. */
  onAnimationEnd(): void {
    if (this.state() === 'leave') {
      this.state.set('hidden');
    }
  }

  /** Pause/resume the auto-reminder timer, e.g. from a settings toggle. */
  toggleAuto(): void {
    this.autoOn = !this.autoOn;
    this.scheduleAuto();
  }

  private bump(): void {
    clearTimeout(this.popTimer);
    this.popping.set(false);
    // restart the CSS animation on the next frame
    requestAnimationFrame(() => {
      this.popping.set(true);
      this.popTimer = setTimeout(() => this.popping.set(false), 600);
    });
  }

  private scheduleAuto(): void {
    clearInterval(this.autoTimer);
    if (!this.autoOn) return;
    this.autoTimer = setInterval(() => this.trigger(), this.intervalMs());
  }
}
