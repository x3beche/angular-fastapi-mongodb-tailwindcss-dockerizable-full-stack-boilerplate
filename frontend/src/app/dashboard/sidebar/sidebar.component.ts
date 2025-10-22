// src/app/components/sidebar/sidebar.component.ts
import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { initFlowbite } from 'flowbite';
import { ThemeService } from 'src/app/theme-service.service';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { Subscription } from 'rxjs';
import { environment } from '../../environment';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class ChatSidebarComponent implements OnInit, OnDestroy, AfterViewInit {
  isCollapsed = false;
  isInitialLoad = true; // İlk render’da animasyonu kapatmak için
  company_logo = '';
  private subscription?: Subscription;

  constructor(
    private themeService: ThemeService,
    private sidebarService: SidebarStateService
  ) {
    this.isCollapsed = this.sidebarService.isCollapsed;
  }

  ngOnInit(): void {
    initFlowbite();
    this.company_logo = `${environment.api}/company_logo/`;
    this.themeService.switchToDarkMode();

    // Sidebar durumunu dinle
    this.subscription = this.sidebarService.collapsed$.subscribe(collapsed => {
      this.isCollapsed = collapsed;
      // Not: isInitialLoad burada değişmiyor, sadece AfterViewInit’ten sonra false olacak
    });
  }

  ngAfterViewInit(): void {
    // İlk paint tamamlandıktan sonra transition’ı aç
    setTimeout(() => {
      this.isInitialLoad = false;
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  onToggle(): void {
    this.sidebarService.toggle();
  }
}