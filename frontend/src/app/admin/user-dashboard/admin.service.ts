import { Injectable } from "@angular/core";
import { environment } from "../../environment";
import { HttpClient, HttpParams } from "@angular/common/http";
import { User } from "../../models/user";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  constructor(private http: HttpClient) {}

  private getUsersApiUrl = `${environment.api}/admin/get_users/`;
  private deleteUserApiUrl = `${environment.api}/admin/delete_user/`;
  private updateUserApiUrl = `${environment.api}/admin/update_user/`;

  getUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.getUsersApiUrl);
  }

  updateUser(user: User): Observable<string> {
    return this.http.post<string>(this.updateUserApiUrl, user);
  }

  deleteUser(user_id: string): Observable<string> {
    let params = new HttpParams().set("user_id", user_id);
    return this.http.delete<string>(this.deleteUserApiUrl, { params });
  }
}
