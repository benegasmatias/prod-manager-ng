import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '@core/auth';
import { SessionService } from '@core/index';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-background p-8 text-center font-sans">
      <div class="flex flex-col items-center gap-6">
        <!-- Premium Spinner -->
        <div class="relative h-20 w-20">
          <div class="absolute inset-0 rounded-full border-4 border-primary/20"></div>
          <div class="absolute inset-0 animate-spin rounded-full border-4 border-primary border-t-transparent shadow-lg"></div>
          <div class="absolute inset-4 rounded-full bg-primary/5 animate-pulse"></div>
        </div>
        
        <div class="space-y-2">
          <h1 class="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Sincronizando con <span class="text-primary italic">Google</span>
          </h1>
          <p class="text-sm font-bold uppercase tracking-widest text-muted-foreground animate-pulse">
            Preparando tu taller de producción...
          </p>
        </div>
      </div>
    </div>
  `
})
export class AuthCallbackComponent implements OnInit {
  private auth = inject(AuthService);
  private session = inject(SessionService);
  private router = inject(Router);

  ngOnInit() {
    console.log('[AuthCallback] Processing authentication callback...');
    
    // The Supabase client automatically handles the hash/query params
    // We just need to wait for the session to be available
    this.checkSession();
  }

  private async checkSession() {
    try {
      const { data: { session }, error } = await this.auth.getSession();
      
      if (error || !session) {
        console.error('[AuthCallback] No session found or error:', error);
        this.router.navigate(['/login'], { queryParams: { error: 'No se pudo iniciar sesión con Google' } });
        return;
      }

      console.log('[AuthCallback] Session detected for:', session.user.email);
      
      // Initialize global session state
      await this.session.initialize();
      
      // Determine redirection
      const target = this.session.getPostLoginRedirect('/dashboard');
      console.log('[AuthCallback] Session initialized, redirecting to:', target);
      
      this.router.navigateByUrl(target);
    } catch (err) {
      console.error('[AuthCallback] Critical error during callback processing:', err);
      this.router.navigate(['/login'], { queryParams: { error: 'Error interno en la autenticación' } });
    }
  }
}
