import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  route = inject(ActivatedRoute);

  returnUrl = '';
  isInvitation = false;

  firstName = signal('');
  lastName = signal('');
  email = signal('');
  phone = signal('');
  password = signal('');
  confirmPassword = signal('');
  
  loading = signal(false);
  googleLoading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  constructor() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    this.isInvitation = this.returnUrl.includes('invitaciones/aceptar');
  }

  async handleSubmit() {
    if (this.password() !== this.confirmPassword()) {
      this.error.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.success.set(null);

    const metadata = {
      full_name: `${this.firstName()} ${this.lastName()}`.trim(),
      first_name: this.firstName(),
      last_name: this.lastName(),
      phone: this.phone(),
    };

    try {
      const { data, error } = await this.authService.signup(this.email(), this.password(), metadata);

      if (error) {
        this.error.set(error.message);
        this.loading.set(false);
      } else {
        if (this.returnUrl) {
          this.success.set('¡Cuenta creada! Iniciá sesión para continuar.');
          setTimeout(() => {
            this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } });
          }, 2000);
        } else {
          this.success.set('Cuenta creada. Revisa tu correo para confirmar (si está activado).');
          this.loading.set(false);
        }
      }
    } catch (err: any) {
      this.error.set('Error inesperado al intentar crear la cuenta.');
      this.loading.set(false);
    }
  }

  async handleGoogleSignIn() {
    this.googleLoading.set(true);
    await this.authService.signInWithGoogle();
  }
}
