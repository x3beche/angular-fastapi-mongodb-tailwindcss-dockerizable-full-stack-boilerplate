import { EventEmitter, Injectable, Output } from "@angular/core";
import { HttpClient, HttpParams, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { tap } from "rxjs";
import { Router } from "@angular/router";
import { environment } from "../environment";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  private readonly apiUrl = `${environment.api}/token/`;
  private readonly tokenKey = "token";
  token_status: boolean = false;

  constructor(private http: HttpClient, private router: Router) {
    this.isAuthenticatedSubject.next(this.hasToken());
  }

  private isAuthenticatedSubject = new BehaviorSubject<boolean>(
    this.hasToken()
  );
  isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  hasToken(): boolean {
    this.token_status = !!localStorage.getItem(this.tokenKey);
    return !!localStorage.getItem(this.tokenKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  login(username: string, password: string): Observable<any> {
    // Create URL-encoded form data

    const body = new HttpParams()
      .set("username", username)
      .set("password", password);

    // Set headers to specify content type
    const headers = new HttpHeaders().set(
      "Content-Type",
      "application/x-www-form-urlencoded"
    );

    // Send a POST request with the form data and headers
    return this.http
      .post<any>(`${this.apiUrl}`, body.toString(), { headers })
      .pipe(
        tap((response) => {
          // Save the response to local storage upon successful login
          localStorage.setItem(this.tokenKey, response.access_token);
          localStorage.setItem("user", JSON.stringify(response.user));
          this.isAuthenticatedSubject.next(true);
          // You can also store specific data from the response if needed
          // localStorage.setItem('user_id', response.user_id);
        })
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem("user");
    this.isAuthenticatedSubject.next(false);
    this.router.navigate([""]);
  }
}
