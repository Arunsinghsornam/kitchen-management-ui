import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface NotificationAlert {
  id: string;
  organizationId?: string;
  outletId?: string;
  message: string;
  userFullName: string;
  userRole: string;
  outletName: string;
  isRead: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/api/notifications`;

  getNotifications(): Observable<NotificationAlert[]> {
    return this.http.get<NotificationAlert[]>(this.base);
  }

  markAllAsRead(): Observable<any> {
    return this.http.post<any>(`${this.base}/mark-read`, {});
  }
}
