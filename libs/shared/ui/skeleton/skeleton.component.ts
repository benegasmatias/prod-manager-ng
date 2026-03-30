import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      [style.width]="width" 
      [style.height]="height" 
      [style.borderRadius]="borderRadius"
      class="animate-pulse bg-zinc-200 dark:bg-zinc-800/80"
    ></div>
  `
})
export class SkeletonComponent {
  @Input() width: string = '100%';
  @Input() height: string = '1rem';
  @Input() borderRadius: string = '0.5rem';
}

@Component({
  selector: 'app-dashboard-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="space-y-8 animate-in fade-in duration-500">
      <!-- Welcome Section -->
      <div class="flex flex-col gap-2">
        <app-skeleton width="200px" height="2rem"></app-skeleton>
        <app-skeleton width="350px" height="1rem"></app-skeleton>
      </div>

      <!-- Quick Stats Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        @for (i of [1,2,3,4,5,6]; track i) {
          <div class="p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <app-skeleton width="2.5rem" height="2.5rem" borderRadius="0.75rem" class="mb-4"></app-skeleton>
            <app-skeleton width="60%" height="0.75rem" class="mb-2"></app-skeleton>
            <app-skeleton width="40%" height="1.5rem"></app-skeleton>
          </div>
        }
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <!-- Main Column -->
        <div class="lg:col-span-8 space-y-8">
          <div class="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
            <div class="flex items-center justify-between mb-8">
               <app-skeleton width="150px" height="1.5rem"></app-skeleton>
               <app-skeleton width="100px" height="1.5rem" borderRadius="1rem"></app-skeleton>
            </div>
            <div class="space-y-4">
               @for (i of [1,2,3,4]; track i) {
                 <div class="flex items-center gap-4">
                   <app-skeleton width="3rem" height="3rem" borderRadius="1rem"></app-skeleton>
                   <div class="flex-1 space-y-2">
                      <app-skeleton width="40%" height="1rem"></app-skeleton>
                      <app-skeleton width="20%" height="0.75rem"></app-skeleton>
                   </div>
                 </div>
               }
            </div>
          </div>
        </div>

        <!-- Sidebar Column -->
        <div class="lg:col-span-4 space-y-8">
           <div class="p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
              <app-skeleton width="120px" height="1.5rem" class="mb-6"></app-skeleton>
              @for (i of [1,2,3]; track i) {
                <div class="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950/50 mb-4">
                  <app-skeleton width="100%" height="3rem" borderRadius="1rem"></app-skeleton>
                </div>
              }
           </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardSkeletonComponent {}

@Component({
  selector: 'app-sidebar-skeleton',
  standalone: true,
  imports: [CommonModule, SkeletonComponent],
  template: `
    <div class="space-y-6 pt-4">
      <div class="px-2 mb-8 flex items-center gap-3">
        <app-skeleton width="2.5rem" height="2.5rem" borderRadius="0.75rem"></app-skeleton>
        <div class="space-y-1.5 flex-1">
          <app-skeleton width="80%" height="0.75rem"></app-skeleton>
          <app-skeleton width="50%" height="0.5rem"></app-skeleton>
        </div>
      </div>

      @for (group of [1,2,3]; track group) {
        <div class="space-y-3">
          <app-skeleton width="40%" height="0.5rem" class="mx-3 mb-2 opacity-50"></app-skeleton>
          @for (item of [1,2,3]; track item) {
            <div class="flex items-center gap-3 px-3 py-1">
              <app-skeleton width="1.25rem" height="1.25rem" borderRadius="0.4rem"></app-skeleton>
              <app-skeleton width="60%" height="0.6rem"></app-skeleton>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class SidebarSkeletonComponent {}
