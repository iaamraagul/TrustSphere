import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { environment } from '../../../environments/environment';

type SocketHandler = (eventPayload: any) => void;

@Injectable({
  providedIn: 'root',
})
export class SocketService {
  private socket?: Socket;
  private handlers = new Map<string, Set<SocketHandler>>();
  private enabledSubject = new BehaviorSubject<boolean>(false);

  enabled$ = this.enabledSubject.asObservable();

  get enabled(): boolean {
    return this.enabledSubject.value;
  }

  enable(): void {
    if (this.socket?.connected || this.socket?.active) {
      this.enabledSubject.next(true);
      return;
    }

    this.socket = io(environment.apiUrl.replace('/api', ''), {
      transports: ['websocket'],
      autoConnect: true,
    });

    this.handlers.forEach((callbacks, eventName) => {
      callbacks.forEach((callback) => this.socket?.on(eventName, callback));
    });

    this.enabledSubject.next(true);
  }

  disable(): void {
    this.socket?.removeAllListeners();
    this.socket?.disconnect();
    this.socket = undefined;
    this.enabledSubject.next(false);
  }

  toggle(): void {
    this.enabled ? this.disable() : this.enable();
  }

  onNotification(callback: SocketHandler): void {
    this.on('notification', callback);
  }

  onAuditCreated(callback: SocketHandler): void {
    this.on('audit:created', callback);
  }

  onUsersChanged(callback: SocketHandler): void {
    this.on('users:changed', callback);
  }

  onDashboardChanged(callback: SocketHandler): void {
    this.on('dashboard:changed', callback);
  }

  off(eventName: string, callback: SocketHandler): void {
    this.handlers.get(eventName)?.delete(callback);
    this.socket?.off(eventName, callback);
  }

  private on(eventName: string, callback: SocketHandler): void {
    const callbacks = this.handlers.get(eventName) ?? new Set<SocketHandler>();
    callbacks.add(callback);
    this.handlers.set(eventName, callbacks);

    if (this.enabled && this.socket) {
      this.socket.on(eventName, callback);
    }
  }
}
