import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '@core/auth';
import { LucideAngularModule, Sparkles, Mail, AlertTriangle, Check, ArrowRight } from 'lucide-angular';
import { ButtonSpinnerComponent } from '@shared/ui';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, LucideAngularModule, ButtonSpinnerComponent],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent {
  icons = { Sparkles, Mail, AlertTriangle, Check, ArrowRight };
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

    const emailStr = this.email().toLowerCase().trim();
    const domain = emailStr.split('@')[1];
    
    // Lista de dominios de correos temporales conocidos
    const disposableDomains = [
      'yopmail.com', 'mailinator.com', 'guerrillamail.com', '10minutemail.com', 
      'tempmail.com', 'temp-mail.org', 'throwawaymail.com', 'fakemail.net', 
      'dropmail.me', 'dispostable.com', 'maildrop.cc', 'sharklasers.com',
      'nada.ltd', 'getairmail.com', 'mohimal.com', 'crazymail.com', '10mail.org'
    ];

    if (domain && disposableDomains.includes(domain)) {
      this.error.set('No se permiten correos electrónicos temporales o desechables.');
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
          this.success.set('¡Registro exitoso! Te enviamos un email de validación. Por favor, confirma tu cuenta para poder ingresar.');
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
    this.error.set(null);
    try {
      const { error } = await this.authService.signInWithGoogle();
      if (error) throw error;
    } catch (err: any) {
      console.error('[Register] Google Auth error:', err);
      this.error.set(err.message || 'Error al conectar con Google');
      this.googleLoading.set(false);
    }
  }
}
