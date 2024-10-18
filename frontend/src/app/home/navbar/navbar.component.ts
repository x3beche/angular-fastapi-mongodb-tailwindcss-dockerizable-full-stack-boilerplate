import { AuthService } from "./../../auth/auth-service.service";
import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { initFlowbite, Modal } from "flowbite";
import type { ModalOptions, ModalInterface } from "flowbite";
import type { InstanceOptions } from "flowbite";
import { Message } from "src/app/models/utils";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
})
export class NavbarComponent {
  isNavbarOpen = false;
  isDropdownOpen = false;
  dashboard_button = false;
  logout_button = false;
  register_button = false;
  login_button = false;
  auth_status: boolean = false;
  login_modal!: ModalInterface;
  messages: Message[] = [];

  loginEnterHandler(event: KeyboardEvent): void {
    event.preventDefault();
    this.login();
  }

  constructor(public authService: AuthService, private router: Router) {
    // Subscribe to the authentication status
    authService.isAuthenticated$.subscribe((status) => {
      this.auth_status = status;
    });
  }
  ngOnInit(): void {
    initFlowbite();
    const $LoginModalement: null | HTMLElement =
      document.querySelector("#LoginModal");

    const modalOptions: ModalOptions = {
      placement: "bottom-right",
      backdrop: "dynamic",
      backdropClasses: "bg-gray-zinc dark:bg-zinc-950/80 fixed inset-0 z-40",
      closable: true,
      onHide: () => {
        console.log("modal is hidden");
      },
      onShow: () => {
        console.log("modal is shown");
      },
      onToggle: () => {
        console.log("modal has been toggled");
      },
    };

    // instance options object
    const instanceOptions: InstanceOptions = {
      id: "LoginModal",
      override: true,
    };

    const modal: ModalInterface = new Modal(
      $LoginModalement,
      modalOptions,
      instanceOptions
    );

    this.login_modal = modal;
    //this.showLoginModal();
  }
  toggleNavbar(): void {
    this.isNavbarOpen = !this.isNavbarOpen;
  }
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }
  logout(): void {
    // Perform the logout operation using the AuthService
    this.authService.logout();
  }
  email: string = "";
  password: string = "";
  login_data: any;
  loading = false;
  login(): void {
    this.loading = true;
    this.authService.login(this.email, this.password).subscribe({
      next: (v) => {
        this.hideLoginModal();
        window.location.reload();
      },
      error: (e) => {
        this.loading = false;
        this.messages = [{ status: false, text: e.error.detail }];
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  showLoginModal(): void {
    this.login_modal.show();
  }
  hideLoginModal(): void {
    this.login_modal.hide();
  }
}
