import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/widget/widget').then((m) => m.Widget),
  },
];
