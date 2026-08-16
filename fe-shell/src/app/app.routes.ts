import { Routes } from '@angular/router';
import { loadRemoteModule } from '@angular-architects/native-federation';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home').then((m) => m.Home)
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login)
  },
  {
    path: 'mfe-1',
    loadComponent: () =>
      loadRemoteModule('mfe-1', './Component').then((m) => m.Widget)
  },
  { path: '**', redirectTo: '' }
];
