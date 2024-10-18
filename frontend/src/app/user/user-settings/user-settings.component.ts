import { Component } from "@angular/core";
import { UserService } from "src/app/user/user.service";
import {
  User,
  UserRegister,
  UserSettingsPasswordCredentials,
  UserSettingsProfileCredentials,
} from "src/app/models/user";
import { Dismiss } from "flowbite";
import type { DismissOptions, DismissInterface } from "flowbite";
import type { InstanceOptions } from "flowbite";
import { Message } from "src/app/models/utils";
import { HttpEventType, HttpResponse } from "@angular/common/http";
import { Router } from "@angular/router";

@Component({
  selector: "app-user-settings",
  templateUrl: "./user-settings.component.html",
})
export class UserSettingsComponent {
  constructor(private userService: UserService, private router: Router) {}
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
    // target element that will be dismissed
    const $targetEl: HTMLElement | null =
      document.getElementById("toast-interactive");

    // optional trigger element
    const $triggerEl: HTMLElement | null =
      document.getElementById("1231231231231");

    // options object
    const options: DismissOptions = {
      transition: "transition-opacity",
      duration: 1000,
      timing: "ease-out",

      // callback functions
      onHide: (context, targetEl) => {
        console.log("element has been dismissed");
        console.log(targetEl);
      },
    };

    // instance options object
    const instanceOptions: InstanceOptions = {
      id: "targetElement",
      override: true,
    };

    /*
     * $targetEl (required)
     * $triggerEl (optional)
     * options (optional)
     * instanceOptions (optional)
     */
    const dismiss: DismissInterface = new Dismiss(
      $targetEl,
      $triggerEl,
      options,
      instanceOptions
    );

    // programmatically hide it
    this.alertdismis = dismiss;
  }
  hideNotification() {
    this.alertdismis.hide();
  }

  ngOnInit(): void {
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

    this.initAlertArea();
    this.hideNotification();
  }

  updateProfile(): void {
    this.user_profile_credentials.process = true;
    this.userService
      .updateUserCredentials(this.user_profile_credentials)
      .subscribe({
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
      this.messages = [
        { status: false, text: "Passwords not match each other." },
      ];
    } else {
      this.user_password_credentials.process = true;
      this.userService
        .updateUserPassword(this.user_password_credentials)
        .subscribe({
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
            this.uploadProgress = Math.round(
              (100 * event.loaded) / event.total
            );
          } else if (event instanceof HttpResponse) {
            this.uploadMessage = "File uploaded successfully!";
          }
        },
        error: (err: any) => {
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
