import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './verify-otp.html',
  styleUrl: './verify-otp.css'
})
export class VerifyOtpComponent implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  otpForm: FormGroup = this.fb.group({
    otpCode: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]]
  });

  email = '';
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  
  // Timer settings
  timerValue = 300; // 5 minutes in seconds
  timerDisplay = '05:00';
  private timerInterval: any;

  ngOnInit(): void {
    this.email = this.route.snapshot.queryParams['email'] || '';
    if (!this.email) {
      this.router.navigate(['/auth/login']);
      return;
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    this.stopCountdown();
  }

  startCountdown(): void {
    this.timerValue = 300;
    this.updateTimerDisplay();
    this.stopCountdown();

    this.timerInterval = setInterval(() => {
      this.timerValue--;
      this.updateTimerDisplay();
      if (this.timerValue <= 0) {
        this.stopCountdown();
      }
    }, 1000);
  }

  stopCountdown(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
    }
  }

  private updateTimerDisplay(): void {
    const minutes = Math.floor(this.timerValue / 60);
    const seconds = this.timerValue % 60;
    const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const secStr = seconds < 10 ? `0${seconds}` : `${seconds}`;
    this.timerDisplay = `${minStr}:${secStr}`;
  }

  onSubmit(): void {
    if (this.otpForm.invalid) {
      this.otpForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { otpCode } = this.otpForm.value;

    this.authService.verifyOtp(this.email, otpCode).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/']);
        }
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'OTP verification failed. Please try again.';
      }
    });
  }

  resendOtp(): void {
    if (this.timerValue > 240) {
      this.errorMessage = 'Please wait a minute before requesting another OTP.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.authService.sendOtp(this.email).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'A new OTP has been sent to your email.';
        this.startCountdown();
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Failed to send a new OTP. Please try again later.';
      }
    });
  }
}
