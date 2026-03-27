import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  email = signal('');
  password = signal('');
  loading = signal(false);
  googleLoading = signal(false);
  error = signal<string | null>(null);

  async handleSubmit() {
    console.log('Login attempt started:', this.email());
    this.loading.set(true);
    this.error.set(null);

    try {
      const { data, error } = await this.authService.login(this.email(), this.password());
      console.log('Auth response received:', { data, error });

      if (error) {
        this.error.set(error.message);
        this.loading.set(false);
      } else {
        console.log('Login successful, navigating to dashboard...');
        this.router.navigate(['/dashboard']);
      }
    } catch (err: any) {
      console.error('Unexpected error during login:', err);
      this.error.set('Error inesperado al intentar iniciar sesión.');
      this.loading.set(false);
    }
  }

  async handleGoogleSignIn() {
    this.googleLoading.set(true);
    // Not implemented yet in AuthService, but follows same pattern
    // await this.authService.signInWithGoogle();
  }
}
