import { Component } from "@angular/core";
import { initFlowbite } from "flowbite";
import { ThemeService } from "./theme-service.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
})
export class AppComponent {
  constructor(private themeService: ThemeService) {}
  ngOnInit(): void {
    initFlowbite();
    this.themeService.switchToDarkMode();
  }
}
