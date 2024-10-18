import { environment } from "../../environment";
import { Component } from "@angular/core";
import { initFlowbite } from "flowbite";
import { ThemeService } from "src/app/theme-service.service";

@Component({
  selector: "app-sidebar",
  templateUrl: "./sidebar.component.html",
})
export class ChatSidebarComponent {
  constructor(private themeService: ThemeService) {}

  company_logo = ``;

  ngOnInit(): void {
    initFlowbite();
    this.company_logo = `${environment.api}/company_logo/`;
    this.themeService.switchToDarkMode();
  }
}
