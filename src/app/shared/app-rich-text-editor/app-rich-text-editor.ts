import { AfterViewInit, Component, ElementRef, Input, forwardRef, inject, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR } from '@angular/forms';
import { QuillEditorComponent, QuillModules } from 'ngx-quill';
import 'quill/dist/quill.snow.css';

@Component({
  selector: 'app-rich-text-editor',
  imports: [FormsModule, QuillEditorComponent],
  templateUrl: './app-rich-text-editor.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppRichTextEditor),
      multi: true,
    },
  ],
})
export class AppRichTextEditor implements ControlValueAccessor, AfterViewInit {
  private readonly elementRef = inject(ElementRef<HTMLElement>);

  @Input() placeholder = 'Insert text here...';

  readonly modules: QuillModules = {
    toolbar: [['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }]],
  };

  readonly ready = signal(false);
  readonly disabled = signal(false);
  value = '';

  private onChangeFn: (value: string) => void = () => {};
  private onTouchedFn: () => void = () => {};

  ngAfterViewInit(): void {
    // Defensive against any container (dialogs, tabs) that attaches its content
    // to the document asynchronously, after this component's own view init runs.
    this.waitUntilConnected();
  }

  private waitUntilConnected(attempt = 0): void {
    if (this.elementRef.nativeElement.isConnected || attempt > 120) {
      this.ready.set(true);
      return;
    }
    requestAnimationFrame(() => this.waitUntilConnected(attempt + 1));
  }

  writeValue(value: string): void {
    this.value = value ?? '';
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChangeFn = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouchedFn = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onModelChange(value: string): void {
    this.value = value;
    this.onChangeFn(value);
  }

  onBlur(): void {
    this.onTouchedFn();
  }
}
