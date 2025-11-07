import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/waste-recycle/waste-recycle')
      .then(m => m.WasteRecycle)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login')
      .then(m => m.Login)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/register/register')
      .then(m => m.Register)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/dashboard')
      .then(m => m.Dashboard)
  },
  {
    path: 'post',
    loadComponent: () => import('./features/post/post-edit/post-edit.component').then(m=>m.PostEditComponent)
  },
  {
    path: 'admin',
    loadComponent: () => import('./features/admin-panel/admin-panel')
      .then(m => m.AdminPanel)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
