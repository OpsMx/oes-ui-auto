import {ActionReducerMap} from '@ngrx/store';
import * as fromAuth from '../auth/store/auth.reducer';
import * as fromLayout from '../layout/store/layout.reducer';
import * as fromAudit from '../audit/store/audit.reducer';
import * as fromPolicy from '../policy-management/store/policyManagenent.reducer';
import * as fromCdDashboard from '../cd-dashboard/store/cd-dashboard.reducer';
import * as fromAppDashboard from '../application/application-dashboard/store/dashboard.reducer';
import * as fromTrendAnalysis from '../application/trend-analysis/store/trend-analysis.reducer';

export interface AppState {
    auth: fromAuth.State;
    layout: fromLayout.State;
    audit: fromAudit.State;
    policy: fromPolicy.State;
    appDashboard: fromAppDashboard.State;
    cdDashboard: fromCdDashboard.State;
    trendAnalysis: fromTrendAnalysis.State;
}

export const appReducers: ActionReducerMap<AppState> = {
    auth: fromAuth.authReducer,
    layout: fromLayout.layoutReducer,
    audit: fromAudit.AuditReducer,
    policy: fromPolicy.PolicyReducer,
    appDashboard: fromAppDashboard.DashboardReducer,
    cdDashboard: fromCdDashboard.CdDashboardReducer,
    trendAnalysis: fromTrendAnalysis.TrendAnalysisReducer,
};
