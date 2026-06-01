import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgApexchartsModule } from 'ng-apexcharts';
import { catchError, forkJoin, of, Subscription } from 'rxjs';
import { DashboardService } from '../../core/services/dashboard.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, OnDestroy {
  loading = true;
  error = '';
  metrics: any = {};
  activities: any[] = [];
  currentUser: any;

  chartSeries: any = [
    {
      name: 'Verifications',
      data: [],
    },
  ];

  chartOptions: any = {
    chart: {
      type: 'area',
      toolbar: { show: false },
      background: 'transparent',
    },
    theme: { mode: 'dark' },
    stroke: { curve: 'smooth' },
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'],
    },
    colors: ['#38bdf8'],
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 0.35,
        opacityFrom: 0.45,
        opacityTo: 0.05,
      },
    },
    grid: {
      borderColor: 'rgba(148, 163, 184, 0.16)',
    },
  };

  private pollId?: number;
  private syncSubscription?: Subscription;
  private readonly dashboardChangedHandler = () => {
    if (!this.socketService.enabled) {
      return;
    }

    this.loadDashboard(true, false);
  };

  constructor(
    private dashboardService: DashboardService,
    private socketService: SocketService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('user') || '{}');

    this.loadDashboard();
    this.socketService.onDashboardChanged(this.dashboardChangedHandler);
    this.socketService.onUsersChanged(this.dashboardChangedHandler);

    this.syncSubscription = this.socketService.enabled$.subscribe((enabled) => {
      enabled ? this.startPolling() : this.stopPolling();
    });
  }

  ngOnDestroy(): void {
    this.socketService.off('dashboard:changed', this.dashboardChangedHandler);
    this.socketService.off('users:changed', this.dashboardChangedHandler);
    this.syncSubscription?.unsubscribe();
    this.stopPolling();
  }

  private startPolling(): void {
    if (this.pollId) {
      return;
    }

    this.pollId = window.setInterval(() => this.loadDashboard(true, false), 30000);
  }

  private stopPolling(): void {
    if (!this.pollId) {
      return;
    }

    window.clearInterval(this.pollId);
    this.pollId = undefined;
  }

  loadDashboard(refresh = false, showLoading = true): void {
    if (refresh) {
      this.dashboardService.refresh();
    }

    this.loading = showLoading;
    this.error = '';

    forkJoin({
      metrics: this.dashboardService.getMetrics(),
      analytics: this.dashboardService.getAnalytics(),
      activity: this.dashboardService.getActivity(),
    })
      .pipe(
        catchError(() => {
          this.error = 'Dashboard services are not reachable. Please check the backend server.';
          return of({
            metrics: {},
            analytics: { monthly: [] },
            activity: [],
          });
        }),
      )
      .subscribe((dashboardResponse: any) => {
        this.zone.run(() => {
          this.metrics = dashboardResponse.metrics;
          this.chartSeries = [
            {
              name: 'Verifications',
              data: dashboardResponse.analytics.monthly,
            },
          ];
          this.activities = dashboardResponse.activity;
          this.loading = false;
          this.cdr.detectChanges();
        });
      });
  }
}
