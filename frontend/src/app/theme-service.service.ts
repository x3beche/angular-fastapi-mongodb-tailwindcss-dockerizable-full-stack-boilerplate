import { Injectable, Renderer2, RendererFactory2 } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class ThemeService {
  private renderer: Renderer2;
  private isDarkMode: boolean;

  constructor(rendererFactory: RendererFactory2) {
    this.renderer = rendererFactory.createRenderer(null, null);
    this.isDarkMode = this.checkInitialTheme();
  }

  private checkInitialTheme(): boolean {
    const theme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    if (theme === "dark" || (!theme && prefersDark)) {
      this.renderer.addClass(document.documentElement, "dark");
      localStorage.setItem("theme", "dark");
      return true;
    } else {
      this.renderer.removeClass(document.documentElement, "dark");
      localStorage.setItem("theme", "light");
      return false;
    }
  }

  toggleTheme(): void {
    if (this.isDarkMode) {
      this.switchToLightMode();
    } else {
      this.switchToDarkMode();
    }
  }

  switchToDarkMode(): void {
    this.renderer.addClass(document.documentElement, "dark");
    localStorage.setItem("theme", "dark");
    this.isDarkMode = true;
  }

  switchToLightMode(): void {
    this.renderer.removeClass(document.documentElement, "dark");
    localStorage.setItem("theme", "light");
    this.isDarkMode = false;
  }

  get currentTheme(): boolean {
    return this.isDarkMode;
  }
}
