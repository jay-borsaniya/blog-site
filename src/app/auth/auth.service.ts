import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnInit } from '@angular/core';
import {
  BehaviorSubject,
  catchError,
  Observable,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import { User } from './user.model';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';

export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  expiresIn: string;
  localId: string;
  registered?: boolean;
}

export interface UserDataResponse {
  firstName: string;
  lastName: string;
  email: string;
  authId: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = new BehaviorSubject<User>(null);
  private tokenExpirationTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  signIn(email: string, password: string): Observable<any> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.API_KEY}`,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        switchMap((resData) => {
          return this.getUserData().pipe(
            tap((usersData) => {
              const res = Object.values(usersData);
              const userData = res.find(
                (user) => user.authId === resData.localId
              );
              this.handleAuthentication(
                resData,
                userData.firstName,
                userData.lastName
              );
            })
          );
        })
      );
  }

  signUp(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ): Observable<any> {
    return this.http
      .post<AuthResponseData>(
        `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.API_KEY}`,
        {
          email: email,
          password: password,
          returnSecureToken: true,
        }
      )
      .pipe(
        catchError(this.handleError),
        switchMap((resData) => {
          return this.storeUserData(
            resData.localId,
            email,
            firstName,
            lastName
          ).pipe(
            tap(() => {
              this.handleAuthentication(resData, firstName, lastName);
            })
          );
        })
      );
  }

  private handleError(errorRes: HttpErrorResponse) {
    let errorMessage: string;

    if (!errorRes.error || !errorRes.error.error) {
      return throwError(errorMessage);
    }

    switch (errorRes.error.error.message) {
      case 'EMAIL_EXISTS':
        errorMessage = 'This email already exists.';
        break;
      case 'INVALID_LOGIN_CREDENTIALS':
        errorMessage = 'Invalid login credentials';
        break;
      case 'TOO_MANY_ATTEMPTS_TRY_LATER : Access to this account has been temporarily disabled due to many failed login attempts. You can immediately restore it by resetting your password or you can try again later.':
        errorMessage = 'Too many requests. Try later';
        break;
      default:
        errorMessage = 'Internal Server Error';
        break;
    }

    return throwError(errorMessage);
  }

  private storeUserData(
    authId: string,
    email: string,
    firstName: string,
    lastName: string
  ): Observable<any> {
    return this.http
      .post(`${environment.API}/users.json`, {
        authId,
        email,
        firstName,
        lastName,
      })
      .pipe(catchError(this.handleError));
  }

  private getUserData() {
    return this.http
      .get<UserDataResponse[]>(`${environment.API}/users.json`)
      .pipe(catchError(this.handleError));
  }

  private handleAuthentication(
    resData: AuthResponseData,
    firstName: string,
    lastName: string
  ) {
    const expirationDate = new Date(
      new Date().getTime() + +resData.expiresIn * 1000
    );

    const user = new User(
      resData.email,
      resData.localId,
      firstName,
      lastName,
      resData.idToken,
      expirationDate
    );

    this.user.next(user);
    this.autoLogout(+resData.expiresIn * 1000);
    localStorage.setItem('userData', JSON.stringify(user));
  }

  autoLogin() {
    const userData: {
      email: string;
      authId: string;
      firstName: string;
      lastName: string;
      _token: string;
      _tokenExpirationDate: string;
    } = JSON.parse(localStorage.getItem('userData'));
    if (!userData) {
      return;
    }

    const loadedUser = new User(
      userData.email,
      userData.authId,
      userData.firstName,
      userData.lastName,
      userData._token,
      new Date(userData._tokenExpirationDate)
    );

    if (loadedUser.token) {
      this.user.next(loadedUser);
      const expirationDuration =
        new Date(userData._tokenExpirationDate).getTime() -
        new Date().getTime();
      this.autoLogout(expirationDuration);
    }
  }

  logout() {
    this.user.next(null);
    this.router.navigate(['/auth']);
    localStorage.removeItem('userData');
    if (this.tokenExpirationTimer) {
      clearTimeout(this.tokenExpirationTimer);
    }
    this.tokenExpirationTimer = null;
  }

  autoLogout(expirationDuration: number) {
    this.tokenExpirationTimer = setTimeout(() => {
      this.logout();
    }, expirationDuration);
  }
}
