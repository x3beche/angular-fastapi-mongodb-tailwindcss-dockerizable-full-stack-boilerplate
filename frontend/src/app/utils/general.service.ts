import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environment";

@Injectable({
  providedIn: "root",
})
export class GeneralService {
  private companyNameURL = `${environment.api}/admin/company_name/`;

  constructor(private http: HttpClient) {}

  update_company_name(company_name: string): Observable<string> {
    return this.http.post<string>(this.companyNameURL, {
      name: company_name,
    });
  }

  get_company_name(): Observable<string> {
    return this.http.get<string>(this.companyNameURL);
  }
}
