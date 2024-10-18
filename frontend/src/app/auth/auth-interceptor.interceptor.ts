import { Injectable } from "@angular/core";
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from "@angular/common/http";
import { Observable, catchError, tap, throwError } from "rxjs";
import { AuthService } from "./auth-service.service";

@Injectable()
export class AuthInterceptorInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(
    request: HttpRequest<unknown>,
    next: HttpHandler
  ): Observable<HttpEvent<unknown>> {
    const authToken = this.authService.getToken();

    if (authToken) {
      // Clone the request and set the authorization header
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${authToken}`,
        },
      });
    }

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          // Successful response handling
        }
      }),
      catchError((error: HttpErrorResponse) => {
        if (error.status === 401) {
          console.log("Unauthorized request. Redirecting to login page.");
          this.authService.logout();
        }

        return throwError(() => error);
      })
    );
  }
}
