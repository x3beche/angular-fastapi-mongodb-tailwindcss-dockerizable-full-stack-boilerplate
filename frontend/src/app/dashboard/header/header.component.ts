import { ThemeService } from "../../theme-service.service";
import { AuthService } from "../../auth/auth-service.service";
import { environment } from "../../environment";
import { User } from "src/app/models/user";
import { Component, Input } from "@angular/core";
import { initFlowbite } from "flowbite";
@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
})
export class ChatHeaderComponent {
  auth_status!: boolean;

  constructor(
    private themeService: ThemeService,
    public authService: AuthService
  ) {
    authService.isAuthenticated$.subscribe((status) => {
      this.auth_status = status;
    });
  }

  profile_picture_url = "";
  user!: User;

  @Input() header_title: string = "";
  username: string = "x3beche";

  ngOnInit(): void {
    initFlowbite();
    this.user = JSON.parse(localStorage.getItem("user") as string) as User;
    this.profile_picture_url = `${environment.api}/profile_picture/${this.user.id}`;
    this.username = this.user.username;
  }

  logout(): void {
    this.authService.logout();
  }
  toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}
