import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { User, UserRegister } from "../../models/user";
import { Observable } from "rxjs";
import { environment } from "../../environment";
import { Message } from "../../models/utils";

@Injectable({
  providedIn: "root",
})
export class RegisterService {
  constructor(private http: HttpClient) {}

  api = `${environment.api}/register/`;

  register(user: UserRegister): Observable<Message> {
    return this.http.post<Message>(this.api, user);
  }
}
