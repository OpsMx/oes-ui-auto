import { ofType, createEffect } from '@ngrx/effects';
import { Actions } from '@ngrx/effects';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, tap, catchError, withLatestFrom } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../../../store/app.reducer';
import * as DashboardActions from './dashboard.actions';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { AppConfigService } from 'src/app/services/app-config.service';


//below function is use to fetch error and return appropriate comments
const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred';
    if (!errorRes.error) {
        return of(DashboardActions.errorOccured({ errorMessage }));
    }
    switch (errorRes.error.message) {
        case 'Authentication Error':
            errorMessage = 'Invalid login credentials';
            break;
        case 'Email Exist':
            errorMessage = 'This email exist already';
            break;
        default:
            errorMessage = 'Error Occurred';
            break;
    }
    return of(DashboardActions.errorOccured({ errorMessage }));
}

@Injectable()
export class AppDashboardEffect {
    constructor(public actions$: Actions,
        public http: HttpClient,
        public store: Store<fromApp.AppState>,
        public router: Router,
        public toastr: NotificationService,
        private environment: AppConfigService,
        public appStore: Store<fromApp.AppState>,
    ) { }

    // Below effect is use for fetch application data present in appdashboard
    fetchappData = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.loadAppDashboard),
            withLatestFrom(this.appStore.select('auth')),
            switchMap(([action,authState]) => {
                return this.http.get(this.environment.config.endPointUrl + 'dashboardservice/v1/dashboard/'+ authState.user +'/applications').pipe(
                    map(resdata => {
                       return DashboardActions.fetchedAppData({appData:resdata});
                    }),
                    catchError(errorRes => {
                        this.toastr.showError('Server Error !!', 'ERROR')
                        return handleError(errorRes);
                    })
                );
            })
        )
    )

    // Below effect is use for fetch network chart data to display network graph
    fetchNetworkChartData = createEffect(() =>
        this.actions$.pipe(
            ofType(DashboardActions.loadAppDashboard),
            switchMap(() => {
                return this.http.get('../../../assets/data/network-topology.json').pipe(
                    map(resdata => {
                       return DashboardActions.fetchNetworkChartData({networkChartData:resdata});
                    }),

                );
            })
        )
    )

   

}
