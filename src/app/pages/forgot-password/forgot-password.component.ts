import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '@core/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.css']
})
export class ForgotPasswordComponent {
  authService = inject(AuthService);
  
  email = signal('');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  async handleSubmit() {
    this.loading.set(true);
    this.error.set(null);
    
    try {
      const { error } = await this.authService.resetPassword(this.email());
      if (error) {
        this.error.set(error.message);
      } else {
        this.success.set('Se ha enviado un correo con instrucciones.');
      }
    } catch (err: any) {
      this.error.set('Ocurrió un error inesperado.');
    } finally {
      this.loading.set(false);
    }
  }
}
