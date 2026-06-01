import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { SocketService } from '../../core/services/socket.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit, OnDestroy {
  users: any[] = [];
  searchText = '';
  editingUser: any = null;
  loading = false;
  saving = false;
  error = '';
  page = 1;
  pageSize = 20;
  total = 0;
  totalPages = 1;

  private readonly usersChangedHandler = (event: any) => {
    if (!this.socketService.enabled || this.searchText.trim()) {
      return;
    }

    if (event.action === 'created' && this.page === 1) {
      this.users = [event.user, ...this.users].slice(0, this.pageSize);
      this.total += 1;
      this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
      return;
    }

    if (event.action === 'updated') {
      this.users = this.users.map((user) => (user._id === event.user._id ? event.user : user));
      return;
    }

    if (event.action === 'deleted') {
      this.users = this.users.filter((user) => user._id !== event.id);
      this.total = Math.max(this.total - 1, 0);
      this.totalPages = Math.ceil(this.total / this.pageSize) || 1;
    }
  };

  newUser = {
    name: '',
    email: '',
    password: '',
    role: 'USER',
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private socketService: SocketService,
    private zone: NgZone,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.loadUsers();
    this.socketService.onUsersChanged(this.usersChangedHandler);
  }

  ngOnDestroy(): void {
    this.socketService.off('users:changed', this.usersChangedHandler);
  }

  isAdmin(): boolean {
    return this.authService.isAdmin();
  }

  loadUsers(page = this.page): void {
    this.loading = true;
    this.error = '';
    this.page = page;

    this.userService.getUsers(this.page, this.pageSize, this.searchText.trim()).subscribe({
      next: (res) => {
        this.zone.run(() => {
          this.users = Array.isArray(res) ? res : res.items || [];
          this.total = Array.isArray(res) ? res.length : res.total || 0;
          this.totalPages = Array.isArray(res) ? 1 : res.totalPages || 1;
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
      error: () => {
        this.zone.run(() => {
          this.error = 'Users could not be loaded. Please check the backend server.';
          this.loading = false;
          this.cdr.detectChanges();
        });
      },
    });
  }

  searchUsers(): void {
    this.loadUsers(1);
  }

  nextPage(): void {
    if (this.page < this.totalPages) {
      this.loadUsers(this.page + 1);
    }
  }

  previousPage(): void {
    if (this.page > 1) {
      this.loadUsers(this.page - 1);
    }
  }

  trackByUserId(_: number, user: any): string {
    return user._id;
  }

  addUser() {
    if (!this.isAdmin()) {
      alert('Unauthorized action');
      return;
    }

    if (!this.newUser.name || !this.newUser.email || !this.newUser.password) {
      alert('Fill all fields');
      return;
    }

    this.saving = true;

    this.userService.addUser(this.newUser).subscribe({
      next: (created: any) => {
        this.users = [created, ...this.users].slice(0, this.pageSize);
        this.total += 1;
        this.totalPages = Math.ceil(this.total / this.pageSize) || 1;

        this.newUser = {
          name: '',
          email: '',
          password: '',
          role: 'USER',
        };
        this.saving = false;
      },
      error: () => {
        this.error = 'User could not be created.';
        this.saving = false;
      },
    });
  }

  deleteUser(id: string) {
    if (!this.isAdmin()) return;

    const snapshot = [...this.users];
    this.users = this.users.filter((user) => user._id !== id);
    this.total = Math.max(this.total - 1, 0);

    this.userService.deleteUser(id).subscribe({
      next: () => {
        if (!this.users.length && this.page > 1) {
          this.loadUsers(this.page - 1);
        }
      },
      error: () => {
        this.users = snapshot;
        this.total += 1;
        this.error = 'User could not be deleted.';
      },
    });
  }

  editUser(user: any) {
    if (!this.isAdmin()) return;
    this.editingUser = { ...user };
  }

  saveUser() {
    if (!this.isAdmin()) return;

    const updatedUser = { ...this.editingUser };
    const snapshot = [...this.users];
    this.users = this.users.map((user) => (user._id === updatedUser._id ? updatedUser : user));
    this.editingUser = null;

    this.userService.updateUser(updatedUser._id, updatedUser).subscribe({
      next: (saved: any) => {
        this.users = this.users.map((user) => (user._id === saved._id ? saved : user));
      },
      error: () => {
        this.users = snapshot;
        this.error = 'User changes could not be saved.';
      },
    });
  }

  toggleStatus(user: any) {
    if (!this.isAdmin()) return;

    const updatedStatus = user.status === 'ACTIVE' ? 'BLOCKED' : 'ACTIVE';
    const snapshot = [...this.users];

    this.users = this.users.map((candidateUser) =>
      candidateUser._id === user._id ? { ...candidateUser, status: updatedStatus } : candidateUser,
    );

    this.userService
      .updateUser(user._id, {
        ...user,
        status: updatedStatus,
      })
      .subscribe({
        error: () => {
          this.users = snapshot;
          this.error = 'Status could not be updated.';
        },
      });
  }
}
