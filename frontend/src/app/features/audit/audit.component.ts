import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuditService } from '../../core/services/audit.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-audit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './audit.component.html',
  styleUrls: ['./audit.component.scss'],
})
export class AuditComponent implements OnInit, OnDestroy {
  logs: any[] = [];
  loading = true;
  error = '';
  searchText = '';
  page = 1;
  pageSize = 25;
  total = 0;
  totalPages = 1;

  private readonly auditCreatedHandler = (log: any) => {
    if (!this.socketService.enabled || this.page !== 1 || this.searchText.trim()) {
      return;
    }

    this.logs = [log, ...this.logs].slice(0, this.pageSize);
    this.total += 1;
    this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
  };

  constructor(
    private auditService: AuditService,
    private socketService: SocketService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadLogs();
    this.socketService.onAuditCreated(this.auditCreatedHandler);
  }

  ngOnDestroy(): void {
    this.socketService.off('audit:created', this.auditCreatedHandler);
  }

  loadLogs(page = this.page): void {
    this.loading = true;
    this.error = '';
    this.page = page;

    this.auditService.getLogs(this.page, this.pageSize, this.searchText.trim()).subscribe({
      next: (auditResponse: any) => {
        this.zone.run(() => {
          this.logs = Array.isArray(auditResponse) ? auditResponse : auditResponse.items || [];
          this.total = Array.isArray(auditResponse)
            ? auditResponse.length
            : auditResponse.total || 0;
          this.totalPages = Array.isArray(auditResponse) ? 1 : auditResponse.totalPages || 1;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = 'Audit logs could not be loaded. Please check the API connection.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  searchLogs(): void {
    this.loadLogs(1);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.loadLogs(this.page + 1);
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.loadLogs(this.page - 1);
    }
  }

  trackByLogId(_: number, log: any): string {
    return log._id;
  }
}
