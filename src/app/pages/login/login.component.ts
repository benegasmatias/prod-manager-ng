import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/auth';
import { SessionService } from '@core/index';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  authService = inject(AuthService);
  sessionService = inject(SessionService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  returnUrl = '';

  email = signal('');
  password = signal('');
  loading = signal(false);
  googleLoading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
  }

  async handleSubmit() {
    console.log('[Login] Attempt started:', this.email());
    this.loading.set(true);
    this.error.set(null);

    // Phase 1: Authentication
    let authData;
    try {
      const { data, error } = await this.authService.login(this.email(), this.password());
      if (error) {
        console.warn('[Login] Authentication failed:', error.message);
        this.error.set(error.message);
        this.loading.set(false);
        return;
      }
      authData = data;
      console.log('[Login] Authentication successful:', authData.user?.email);
    } catch (err: any) {
      console.error('[Login] Critical Auth error:', err);
      this.error.set('Error de conexión con el servidor de autenticación.');
      this.loading.set(false);
      return;
    }

    // Phase 2: Session Initialization
    try {
      console.log('[Login] Waiting for session service initialization...');
      // Explicitly trigger and await initialization to avoid race conditions with effects
      await this.sessionService.initialize();
      
      const target = this.sessionService.getPostLoginRedirect(this.returnUrl);
      console.log('[Login] Initialization complete, redirecting to:', target);
      
      this.loading.set(false);
      await this.router.navigateByUrl(target);
    } catch (err: any) {
      console.error('[Login] Session initialization failed:', err);
      // We don't necessarily want to block the user if auth succeeded but init had a glitch
      // Often, a simple navigation to dashboard will trigger a retry
      this.loading.set(false);
      this.error.set('Sesión iniciada, pero hubo un problema al cargar tus datos. Intentando entrar...');
      
      // Attempt bypass navigation after a short delay
      setTimeout(() => this.router.navigateByUrl('/dashboard'), 2000);
    }
  }

  async handleGoogleSignIn() {
    this.googleLoading.set(true);
    // Not implemented yet in AuthService, but follows same pattern
    // await this.authService.signInWithGoogle();
  }
}
