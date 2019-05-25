import { createFeatureSelector } from '@ngrx/store';
import { DashboardState } from './dashboard.reducer';


// selector

export const selectDashboardState = createFeatureSelector<DashboardState>('dashboard');
