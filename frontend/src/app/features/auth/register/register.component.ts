import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  form: FormGroup;
  submitted = false;
  loading = false;
  registerError = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private http: HttpClient,
  ) {
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get nameInvalid(): boolean {
    const control = this.form.get('name');
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  get emailInvalid(): boolean {
    const control = this.form.get('email');
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  get passwordInvalid(): boolean {
    const control = this.form.get('password');
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit(): void {
    this.submitted = true;
    this.registerError = '';

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;

    this.http
      .post(`${environment.apiUrl}/auth/register`, {
        ...this.form.value,
        role: 'USER',
      })
      .subscribe({
        next: () => {
          this.router.navigate(['/auth/login']);
        },
        error: (registrationError) => {
          console.error('Registration failed:', registrationError);
          this.registerError = registrationError.error?.message || 'Registration failed';
          this.loading = false;
        },
      });
  }
}
