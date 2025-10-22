// src/app/services/sidebar-state.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarStateService {
  private readonly STORAGE_KEY = 'sidebarCollapsed';
  private collapsedSubject: BehaviorSubject<boolean>;
  public collapsed$: Observable<boolean>;

  constructor() {
    const savedState = localStorage.getItem(this.STORAGE_KEY);
    const initialState = savedState === 'true';
    this.collapsedSubject = new BehaviorSubject<boolean>(initialState);
    this.collapsed$ = this.collapsedSubject.asObservable();
  }

  get isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }

  toggle(): void {
    const newState = !this.collapsedSubject.value;
    this.collapsedSubject.next(newState);
    localStorage.setItem(this.STORAGE_KEY, String(newState));
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsedSubject.next(collapsed);
    localStorage.setItem(this.STORAGE_KEY, String(collapsed));
  }
}