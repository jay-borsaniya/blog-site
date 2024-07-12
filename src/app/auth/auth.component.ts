import { ChangeDetectorRef, Component, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.css'],
})
export class AuthComponent implements OnInit {
  showPassword = false;
  showConfirmPassword = false;
  isLoginPage = true;
  loginForm!: FormGroup;
  registerForm!: FormGroup;
  errorMsg!: string;
  isLoading = false;
  @Output() isAuthenticated = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initLoginForm();
  }

  closeError() {
    this.errorMsg = null;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  toggleAuth() {
    this.isLoginPage = !this.isLoginPage;
    if (this.isLoginPage) {
      this.initLoginForm();
    } else {
      this.initRegisterForm();
    }
  }

  initLoginForm() {
    this.loginForm = new FormGroup({
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
      ]),
    });
  }

  initRegisterForm() {
    this.registerForm = new FormGroup({
      firstName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
      lastName: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9]+$/),
      ]),
      email: new FormControl('', [
        Validators.required,
        Validators.pattern(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/),
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.matchPasswords.bind(this) as ValidatorFn,
      ]),
      confirmPassword: new FormControl('', [
        Validators.required,
        Validators.minLength(8),
        this.matchPasswords.bind(this) as ValidatorFn,
      ]),
    });
  }

  onSubmit(type: string) {
    let authObs: Observable<any>;

    this.isLoading = true;
    if (type === 'login') {
      authObs = this.authService.signIn(
        this.loginForm.value.email,
        this.loginForm.value.password
      );
    } else {
      authObs = this.authService.signUp(
        this.registerForm.value.email,
        this.registerForm.value.password,
        this.registerForm.value.firstName,
        this.registerForm.value.lastName
      );
    }

    authObs.subscribe(
      () => {
        this.isLoading = false;

        if (type === 'login') {
          this.loginForm.reset();
        } else {
          this.registerForm.reset();
        }

        this.router.navigate(['/blogs']);
      },
      (errorMessage) => {
        this.errorMsg = errorMessage;
        this.isLoading = false;
      }
    );
  }

  matchPasswords(control: FormControl) {
      
    let password = control.get('password');
    let confirmPassword = control.get('confirmPassword');
    if (
      password?.value !== confirmPassword?.value &&
      password?.dirty &&
      confirmPassword?.dirty
    ) {
      this.errorMsg = 'Passwords Not Matched';
      return { matchPasswords: false };
    } else {
      if (this.errorMsg === 'Passwords Not Matched') {
        this.errorMsg = null;
      }
      return null;
    }
  }
}
