import { Component, OnInit, OnDestroy } from "@angular/core";
import { Subscription } from "rxjs";
import { UserService } from "src/app/user/user.service";
import {
  UserRegister,
  UserSettingsPasswordCredentials,
  UserSettingsProfileCredentials,
} from "src/app/models/user";
import { Message } from "src/app/models/utils";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { Dismiss } from "flowbite";
import type { DismissOptions, DismissInterface } from "flowbite";
import type { InstanceOptions } from "flowbite";
import { SidebarStateService } from "src/app/services/sidebar-state.service";

@Component({
  selector: "app-user-settings",
  templateUrl: "./user-settings.component.html",
})
export class UserSettingsComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  private subscription?: Subscription;

  constructor(
    private userService: UserService,
    private sidebarService: SidebarStateService
  ) {
    this.sidebarCollapsed = this.sidebarService.isCollapsed;
  }

  user!: UserRegister;

  user_profile_credentials: UserSettingsProfileCredentials = {
    email: "",
    username: "",
    first_name: "",
    last_name: "",
    process: false,
  };

  user_password_credentials: UserSettingsPasswordCredentials = {
    current_password: "",
    password: "",
    re_password: "",
    process: false,
  };

  messages: Message[] = [];
  alertdismis!: DismissInterface;

  selectedFile?: File;
  uploadProgress: number = 0;
  uploadMessage: string = "";
  profilePictureUploadStatus = false;

  initAlertArea(): void {
    const $targetEl: HTMLElement | null = document.getElementById("toast-interactive");
    const $triggerEl: HTMLElement | null = document.getElementById("1231231231231");

    const options: DismissOptions = {
      transition: "transition-opacity",
      duration: 1000,
      timing: "ease-out",
      onHide: (context, targetEl) => {
        console.log("element has been dismissed");
        console.log(targetEl);
      },
    };

    const instanceOptions: InstanceOptions = {
      id: "targetElement",
      override: true,
    };

    const dismiss: DismissInterface = new Dismiss(
      $targetEl,
      $triggerEl,
      options,
      instanceOptions
    );

    this.alertdismis = dismiss;
  }

  hideNotification() {
    this.alertdismis?.hide();
  }

  ngOnInit(): void {
    this.subscription = this.sidebarService.collapsed$.subscribe(
      (collapsed) => (this.sidebarCollapsed = collapsed)
    );

    // Mevcut kullanıcı bilgilerini yükle
    this.userService.getUser().subscribe({
      next: (user: UserRegister) => {
        this.user_profile_credentials = {
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          process: false,
        };
      },
    });

    // Flowbite alert init ve kapatma
    this.initAlertArea();
    this.hideNotification();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  updateProfile(): void {
    this.user_profile_credentials.process = true;
    this.userService.updateUserCredentials(this.user_profile_credentials).subscribe({
      complete: () => {
        this.user_profile_credentials.process = false;
      },
    });
  }

  updatePassword(): void {
    if (
      this.user_password_credentials.password !=
      this.user_password_credentials.re_password
    ) {
      this.messages = [{ status: false, text: "Passwords not match each other." }];
    } else {
      this.user_password_credentials.process = true;
      this.userService.updateUserPassword(this.user_password_credentials).subscribe({
        next: (response) => {
          this.messages = [{ status: true, text: response }];
        },
        error: (response) => {
          this.messages = [{ status: false, text: response.error.detail }];
          this.user_password_credentials.process = false;
        },
        complete: () => {
          this.user_password_credentials.process = false;
        },
      });
    }
  }

  onFileChange(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  upload(): void {
    if (this.selectedFile) {
      this.profilePictureUploadStatus = true;
      this.userService.uploadFile(this.selectedFile).subscribe({
        next: (event: any) => {
          if (event.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
          } else if (event instanceof HttpResponse) {
            this.uploadMessage = "File uploaded successfully!";
          }
        },
        error: (_err: any) => {
          this.uploadProgress = 0;
          this.uploadMessage = "File upload failed!";
        },
        complete: () => {
          this.profilePictureUploadStatus = false;
          window.location.reload();
        },
      });
    }
  }
}