import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { SocketService } from '../../../core/services/socket.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
  form: FormGroup;
  submitted = false;
  loading = false;
  authError = '';
  passwordVisible = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
    private socketService: SocketService,
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      role: ['ADMIN'],
    });
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  setRole(role: 'ADMIN' | 'USER'): void {
    this.form.patchValue({ role });
  }

  togglePassword(): void {
    this.passwordVisible = !this.passwordVisible;
  }

  goToRegister(): void {
    this.router.navigateByUrl('/auth/register');
  }

  submit(): void {
    this.submitted = true;
    this.authError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.http.post(`${environment.apiUrl}/auth/login`, this.form.value).subscribe({
      next: (loginResponse: any) => {
        localStorage.setItem('token', loginResponse.token);

        localStorage.setItem('user', JSON.stringify(loginResponse.user));

        this.socketService.disable();
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        this.authError = error?.error?.message || 'We could not verify those credentials.';
        this.loading = false;
      },
    });
  }
}
