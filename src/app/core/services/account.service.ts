import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable, of, ReplaySubject} from 'rxjs';
import {AccountPasswordUpdate, AccountUpdate, AdventurerCreate, CustomerCreate, Role, User} from '../models';
import {delay, distinctUntilChanged, flatMap, map, tap} from 'rxjs/operators';
import {ApiService} from './api.service';
import {JwtService} from './jwt.service';
import {Router} from '@angular/router';
import {NotificationService} from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private endpoint = '/users';
  private currentUserSubject = new ReplaySubject<User>(1);
  public currentUser = this.currentUserSubject.asObservable().pipe(distinctUntilChanged());

  private isAuthenticatedSubject = new ReplaySubject<boolean>(1);

  constructor(
    private http: HttpClient,
    private apiService: ApiService,
    private jwtService: JwtService,
    private router: Router,
    private notificationService: NotificationService
  ) {
  }

  /**
   * Token received.
   */
  get isAuthenticated() {
    return this.isAuthenticatedSubject.asObservable();
  }

  /**
   * Authentication user.
   * @param credentials login and password.
   * @return user data.
   */
  logIn(credentials): Observable<User> {
    return this.apiService.post(`/auth/`, credentials)
      .pipe(flatMap(
        data => {
          this.setToken(data.token);
          return this.apiService.get('/account/').pipe(
            map(user => {
              if (user.blocked) {
                this.purgeAuth();
                throw new Error('You are blocked');
              } else {
                this.setAuth(user);
              }
              return user;
            })
          );
        }
      ));
  }

  /**
   * Create customer
   * @param newUser customer model
   */
  createCustomer(newUser: CustomerCreate) {
    return this.apiService.post('/users/', newUser);
  }

  /**
   * Create adventurer
   * @param newUser adventurer model
   */
  createAdventurer(newUser: AdventurerCreate) {
    return this.apiService.post('/adventurers/', newUser);
  }

  /**
   * Logout from system.
   */
  logOut() {
    this.purgeAuth();
    this.router.navigateByUrl('/content/login');
  }

  public updateAccountInfo(updateInfo: AccountUpdate): Observable<User> {
    return this.apiService.put('/account/', updateInfo).pipe(
      tap(user => this.setUser(user))
    );
  }

  public updatePassword(updatePasswordInfo: AccountPasswordUpdate): Observable<void> {
    return this.apiService.put('/account/password/', updatePasswordInfo).pipe(
      tap(() => {
        this.logOut();
      })
    );
  }

  // Verify JWT in localstorage with server & load user's info.
  // This runs once on application startup.
  populate() {
    // If JWT detected, attempt to get & store user's info
    if (this.jwtService.getToken()) {
      this.isAuthenticatedSubject.next(true);
      this.apiService.get('/account/')
        .subscribe(
          user => {
            if (!user.blocked) {
              this.setAuth(user);
            }
          },
          err => this.purgeAuth()
        );
    } else {
      // Remove any potential remnants of previous auth states
      this.purgeAuth();
    }
  }

  // Save JWT sent from server in localstorage
  private setToken(token: string) {
    if (!token) {
      throw Error('Token is null');
    }

    this.jwtService.saveToken(token);
    this.isAuthenticatedSubject.next(true);
  }

  // Sett current user and isAuth flag.
  private setAuth(user: User) {
    this.notificationService.startService();
    this.setUser(user);
    // Set isAuthenticated to true
    this.isAuthenticatedSubject.next(true);
    console.log('user login');
  }

  private setUser(user: User) {
    // Set current user data into observable
    this.currentUserSubject.next(user);
  }

  // Purge current user and drop isAuth flag.
  private purgeAuth() {
    this.notificationService.stopService();
    // Remove JWT from localstorage
    this.jwtService.destroyToken();
    // Set current user to an empty object
    this.currentUserSubject.next(undefined);
    // Set auth status to false
    this.isAuthenticatedSubject.next(false);
    console.log('User logon');
  }
}
