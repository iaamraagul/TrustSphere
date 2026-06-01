import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-fraud',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './fraud.component.html',
  styleUrls: ['./fraud.component.scss'],
})
export class FraudComponent {
  alerts = [
    {
      user: 'John',
      risk: 'High',
      reason: 'Multiple failed logins',
      status: 'Investigating',
      score: 84,
    },

    {
      user: 'Sophia',
      risk: 'Medium',
      reason: 'Location mismatch',
      status: 'Queued',
      score: 62,
    },

    {
      user: 'Michael',
      risk: 'Critical',
      reason: 'Admin privilege escalation',
      status: 'Escalated',
      score: 97,
    },
  ];

  get criticalCount(): number {
    return this.alerts.filter((alert) => alert.risk === 'Critical').length;
  }

  get highCount(): number {
    return this.alerts.filter((alert) => alert.risk === 'High').length;
  }
}
