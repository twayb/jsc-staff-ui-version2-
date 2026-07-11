import { Component, Input } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';

type SkeletonVariant = 'table' | 'cards' | 'list';

@Component({
  selector: 'app-skeleton',
  imports: [Skeleton],
  templateUrl: './app-skeleton.html',
})
export class AppSkeleton {
  @Input() variant: SkeletonVariant = 'table';
  @Input() rows = 5;
  @Input() columns = 4;
  @Input() count = 4;
  @Input() cardCols = 3;

  get rowsArray(): number[] {
    return Array.from({ length: this.rows });
  }

  get columnsArray(): number[] {
    return Array.from({ length: this.columns });
  }

  get countArray(): number[] {
    return Array.from({ length: this.count });
  }
}
