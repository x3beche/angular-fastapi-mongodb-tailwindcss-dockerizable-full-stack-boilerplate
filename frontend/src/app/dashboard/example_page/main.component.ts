// src/app/pages/main/main.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { SidebarStateService } from 'src/app/services/sidebar-state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
})
export class MainComponent implements OnInit, OnDestroy {
  sidebarCollapsed = false;
  private subscription?: Subscription;

  constructor(private sidebarService: SidebarStateService) {
    this.sidebarCollapsed = this.sidebarService.isCollapsed;
  }

  ngOnInit(): void {
    this.subscription = this.sidebarService.collapsed$.subscribe(
      collapsed => this.sidebarCollapsed = collapsed
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}