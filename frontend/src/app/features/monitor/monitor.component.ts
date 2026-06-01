import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-monitor',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monitor.component.html',
  styleUrls: ['./monitor.component.scss'],
})
export class MonitorComponent {
  serverStatus = 'ONLINE';

  apiDelay = 42;

  memory = 68;

  cpu = 41;

  nodes = [
    {
      name: 'Identity classifier',
      status: 'Healthy',
      latency: '32ms',
      throughput: '12.4k/min',
      confidence: 98,
    },
    {
      name: 'Document OCR',
      status: 'Watching',
      latency: '88ms',
      throughput: '4.8k/min',
      confidence: 91,
    },
    {
      name: 'Risk anomaly model',
      status: 'Healthy',
      latency: '45ms',
      throughput: '8.1k/min',
      confidence: 96,
    },
  ];
}
