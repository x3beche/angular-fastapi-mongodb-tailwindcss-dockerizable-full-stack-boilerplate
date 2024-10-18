import { HttpClient, HttpEvent, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { environment } from "../environment";
import { FileInfo } from "./content.component";

@Injectable({
  providedIn: "root",
})
export class ContentServiceService {
  private contentUploadUrl = `${environment.api}/content/upload/`;
  private userContentUploadUrl = `${environment.api}/user/content_upload/`;
  private generalContentGetUrl = `${environment.api}/content/general_file_list/`;
  private updateFileContentUrl = `${environment.api}/content/update_file/`;
  private deleteFileContentUrl = `${environment.api}/content/delete_file/`;

  constructor(private http: HttpClient) {}

  userUploadFiles(files: File[]): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const headers = new HttpHeaders();
    headers.append("Content-Type", "multipart/form-data");

    // Returning observable with reportProgress and observe: 'events' to track progress
    return this.http.post<any>(this.userContentUploadUrl, formData, {
      headers,
      reportProgress: true, // Enables tracking of progress events
      observe: "events", // Observe the whole request lifecycle, including progress events
    });
  }

  uploadFiles(files: File[]): Observable<HttpEvent<any>> {
    const formData: FormData = new FormData();

    files.forEach((file) => {
      formData.append("files", file, file.name);
    });

    const headers = new HttpHeaders();
    headers.append("Content-Type", "multipart/form-data");

    // Returning observable with reportProgress and observe: 'events' to track progress
    return this.http.post<any>(this.contentUploadUrl, formData, {
      headers,
      reportProgress: true, // Enables tracking of progress events
      observe: "events", // Observe the whole request lifecycle, including progress events
    });
  }

  getGeneralFiles(): Observable<FileInfo[]> {
    return this.http.get<FileInfo[]>(this.generalContentGetUrl);
  }

  updateFile(file_info: FileInfo): Observable<FileInfo> {
    return this.http.post<FileInfo>(this.updateFileContentUrl, file_info);
  }

  deleteFile(file_info: FileInfo): Observable<string> {
    return this.http.post<string>(this.deleteFileContentUrl, file_info);
  }
}
