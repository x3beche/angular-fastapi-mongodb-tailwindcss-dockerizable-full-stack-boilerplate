import { Component } from "@angular/core";
import { ContentServiceService } from "./content-service.service";
import { HttpEventType } from "@angular/common/http";
import { Dropdown, DropdownInterface, Modal } from "flowbite";
import { User } from "../models/user";

export enum FileTypes {
  Document = "document",
  Image = "image",
}

// Enum for ContentTypes
export enum ContentTypes {
  User = "user",
  General = "general",
}

export interface FileInfo {
  id: string;
  name: string;
  size: number;
  added_date: Date;
  added_by: string;
  activated: boolean;
  file_type: FileTypes; // Using FileTypes Enum
  content_type: ContentTypes; // Using ContentTypes Enum
  usage: string;
}

export interface FileInfoLite {
  id: string;
  name: string;
  size: number;
  loading_status: boolean;
  content?: "";
}

@Component({
  selector: "app-content",
  templateUrl: "./content.component.html",
})
export class ContentComponent {
  constructor(private contentService: ContentServiceService) {}

  fileContentsPaginationInfo = {
    page: 1,
    page_size: 12,
    start: 0,
    end: 0,
    total: 0,
    pages: [1],
    search_text: "",
  };

  files: FileInfo[] = [];
  s_file!: FileInfo;
  file_delete_status = false;
  file_delete_modal!: Modal;
  selectedFiles!: File[];
  uploadProgress: number = 0;

  user!: User;

  ngOnInit(): void {
    this.contentService.getGeneralFiles().subscribe({
      next: (res) => {
        this.files = res;
        this.s_file = this.files[0];
      },
    });
    this.user = JSON.parse(localStorage.getItem("user") as string) as User;
    const $targetEl2 = document.getElementById("file-delete-modal");
    this.file_delete_modal = new Modal($targetEl2);
  }

  filter_files(files: FileInfo[]) {
    // Normalize the search text to lowercase for case-insensitive search
    const normalizedSearchText = this.fileContentsPaginationInfo.search_text
      .trim()
      .toLowerCase();

    // Filter users based on the selected roles and search text (email, first_name, last_name)
    const filteredUsers = files.filter((element) => {
      // Check if any of the user's email, first name, or last name contains the search text
      const searchMatches = [
        element.name.toLowerCase(),
        element.added_by.toLowerCase(),
      ].some((field) => field.includes(normalizedSearchText));

      // Return true if both the role and search text match
      return searchMatches;
    });

    // Calculate pagination
    const totalUsers = filteredUsers.length;
    const startIndex =
      (this.fileContentsPaginationInfo.page - 1) *
      this.fileContentsPaginationInfo.page_size;
    const endIndex = Math.min(
      this.fileContentsPaginationInfo.page *
        this.fileContentsPaginationInfo.page_size,
      totalUsers
    ); // Limit to total users if less than pageSize

    // Get the paginated users for the current page

    // Generate the pagination info string
    this.fileContentsPaginationInfo.start = startIndex;
    this.fileContentsPaginationInfo.end = endIndex;
    this.fileContentsPaginationInfo.total = totalUsers;

    const totalPages = Math.ceil(
      totalUsers / this.fileContentsPaginationInfo.page_size
    );

    // Update the pages array based on total pages
    this.fileContentsPaginationInfo.pages = Array.from(
      { length: totalPages },
      (_, i) => i + 1
    );
    if (
      this.fileContentsPaginationInfo.page >
      this.fileContentsPaginationInfo.pages[-1]
    ) {
      this.fileContentsPaginationInfo.page = 0;
    }
    return filteredUsers.slice(startIndex, endIndex);
  }
  changePage(page: number): void {
    this.fileContentsPaginationInfo.page = page;
  }
  handleFileInput(event: any): void {
    this.selectedFiles = Array.from(event.target.files);

    // Log the selected files
    console.log("Selected Files:", this.selectedFiles);

    if (this.selectedFiles.length > 0) {
      // Log the start of the upload
      console.log("Starting upload of selected files...");

      // Call the service to upload files
      this.contentService.uploadFiles(this.selectedFiles).subscribe({
        next: (event) => {
          switch (event.type) {
            case HttpEventType.UploadProgress:
              if (event.total) {
                this.uploadProgress = Math.round(
                  (100 * event.loaded) / event.total
                );
                console.log(`Upload Progress: ${this.uploadProgress}%`);
              }
              break;
            case HttpEventType.Response:
              for (const item of event.body) {
                this.files.push(item);
              }
          }
        },
        error: (err) => {
          console.error("Upload failed", err);
        },
        complete: () => {
          console.log("Upload process completed.");
        },
      });
    } else {
      console.error("No files selected.");
    }
  }
  openFile() {
    const fileInput = document.getElementById("content_file_input");
    if (fileInput) {
      fileInput.click();
    }
  }
  closeDropdown(id: string): void {
    const $targetEl: HTMLElement | null = document.getElementById(
      id + "-file-dropdown"
    );
    const $triggerEl: HTMLElement | null = document.getElementById(
      id + "-file-dropdown-button"
    );
    const dropdown: DropdownInterface = new Dropdown($targetEl, $triggerEl);

    dropdown.hide();
  }
  openDropdown(id: string): void {
    const $targetEl: HTMLElement | null = document.getElementById(
      id + "-file-dropdown"
    );
    const $triggerEl: HTMLElement | null = document.getElementById(
      id + "-file-dropdown-button"
    );
    const dropdown: DropdownInterface = new Dropdown($targetEl, $triggerEl);

    dropdown.toggle();
  }
  fileActivationChange(file_id: string, event: any) {
    const i = this.files.findIndex((f) => f.id === file_id);
    this.files[i].activated = event.target.checked;
    this.contentService.updateFile(this.files[i]).subscribe({
      next: (res) => {},
    });
  }
  updateFileUsage(file_id: string, usage: string) {
    const i = this.files.findIndex((f) => f.id === file_id);
    this.files[i].usage = usage;
    this.closeDropdown(file_id);
    this.contentService.updateFile(this.files[i]).subscribe({
      next: (res) => {},
    });
  }
  file_delete_button_click(file_id: string) {
    const i = this.files.findIndex((f) => f.id === file_id);
    this.s_file = this.files[i];
    this.file_delete_modal.show();
    this.closeDropdown(file_id);
  }
  fileDeleteButtonHandler(file_id: string) {
    this.file_delete_status = true;
    const i = this.files.findIndex((f) => f.id === file_id);
    this.s_file = this.files[i];
    this.contentService.deleteFile(this.s_file).subscribe({
      complete: () => {
        this.files.splice(i, 1);
        this.file_delete_status = false;
        this.file_delete_modal.hide();
      },
    });
  }
  setUsage(file_id: string, usage: string) {
    console.log("====================================");
    console.log(file_id, usage);
    console.log("====================================");
  }
}
