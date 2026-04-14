import { Routes } from '@angular/router';
import { TrackerComponent } from './pages/tracker/tracker.component';
// Импортируем напрямую, чтобы избежать проблем с путями в динамическом импорте
import { HistoryComponent } from './pages/history/history.component';

export const routes: Routes = [
  { 
    path: '', 
    component: TrackerComponent 
  },
  { 
    path: 'history', 
    component: HistoryComponent 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];