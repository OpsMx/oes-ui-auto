import { ofType, createEffect } from '@ngrx/effects';
import { Actions } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../../store/app.reducer';
import * as MetricAnalysisdActions from './metric-analysis.actions';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { AppConfigService } from 'src/app/services/app-config.service';


//below function is use to fetch error and return appropriate comments
const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred';
    if (!errorRes.error) {
        return of(MetricAnalysisdActions.errorOccured({ errorMessage }));
    }
    switch (errorRes.error.message) {
        case 'Authentication Error':
            errorMessage = 'Invalid login credentials';
            break;
        default:
            errorMessage = 'Error Occurred';
            break;
    }
    return of(MetricAnalysisdActions.errorOccured({ errorMessage }));
}

@Injectable()
export class MetricAnalysisEffect {
    user: any;
    constructor(public actions$: Actions,
        public http: HttpClient,
        public store: Store<fromApp.AppState>,
        public router: Router,
        public toastr: NotificationService,
        private environment: AppConfigService
    ) { }

    // Below effect is use for fetch metricAnalysis initial data i.e, CanaryOutputData
    fetchHealthChartData = createEffect(() =>
        this.actions$.pipe(
            ofType(MetricAnalysisdActions.loadMetricAnalysis),
            switchMap(() => {
                return this.http.get(this.environment.config.autoPilotEndPointUrl +'cas/getCanaryOutputNew?canaryId=542&serviceId=847').pipe(
                    map(resdata => {
                       return MetricAnalysisdActions.fetchCanaryOutput({cararyData:resdata});
                    }),
                );
            })
        )
    )
}