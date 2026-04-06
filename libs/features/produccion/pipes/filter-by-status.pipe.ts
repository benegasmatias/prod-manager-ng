import { Pipe, PipeTransform } from '@angular/core';
import { ProductionJob } from '../../../shared/models/production-job';

@Pipe({
  name: 'filterByStatus',
  standalone: true
})
export class FilterByStatusPipe implements PipeTransform {
  transform(jobs: ProductionJob[], status: string): ProductionJob[] {
    if (!jobs || !status) return [];
    return jobs.filter(j => j.status === status);
  }
}
