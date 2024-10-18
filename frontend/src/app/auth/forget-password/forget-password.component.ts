import { environment } from "./../../environment";
import { Message } from "src/app/models/utils";
import { HttpClient } from "@angular/common/http";
import { Component } from "@angular/core";
@Component({
  selector: "app-forget-password",
  templateUrl: "./forget-password.component.html",
})
export class ForgetPasswordComponent {
  constructor(private http: HttpClient) {}

  email: string = "";
  loading: boolean = false;
  messages: Message[] = [];

  send_password_reset_link(): void {
    this.loading = true;
    this.http
      .get(`${environment.api}/forget_password/?email=${this.email}`)
      .subscribe((data) => {
        this.messages.push({
          text: "Password reset request has been sent, it will only be valid for 15 minutes.",
          status: true,
        });
        this.loading = false;
      });
  }
}
