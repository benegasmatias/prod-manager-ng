import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  theme = signal<'light' | 'dark'>(
    (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
  );

  constructor() {
    console.log('[ThemeService] Initializing. Current localStorage theme:', localStorage.getItem('theme'));
    
    effect(() => {
      const currentTheme = this.theme();
      console.log('[ThemeService] Effect triggered. New theme:', currentTheme);
      localStorage.setItem('theme', currentTheme);
      
      if (currentTheme === 'dark') {
        document.documentElement.classList.add('dark');
        console.log('[ThemeService] Added .dark class to <html>. Current classes:', document.documentElement.className);
      } else {
        document.documentElement.classList.remove('dark');
        console.log('[ThemeService] Removed .dark class from <html>. Current classes:', document.documentElement.className);
      }
    });

    // Initialize state from system preference if no localStorage
    if (!localStorage.getItem('theme')) {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.theme.set(prefersDark ? 'dark' : 'light');
    }
  }

  toggleTheme() {
    const next = this.theme() === 'light' ? 'dark' : 'light';
    console.log('[ThemeService] toggleTheme() called. Switching to:', next);
    this.theme.set(next);
  }
}
