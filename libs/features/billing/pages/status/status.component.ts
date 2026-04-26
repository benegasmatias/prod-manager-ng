import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SessionService } from '@core/session/session.service';

@Component({
  selector: 'app-billing-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.scss']
})
export class StatusComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private session = inject(SessionService);
  status: 'success' | 'failure' | 'pending' = 'success';

  ngOnInit() {
    this.status = this.route.snapshot.data['status'] || 'success';

    if (this.status === 'success') {
      // Esperamos un segundo para que el webhook del backend procese el pago
      // y luego refrescamos la sesión para actualizar el plan y los límites.
      setTimeout(() => {
        this.session.initialize().catch(console.error);
      }, 2000);
    }
  }
}
