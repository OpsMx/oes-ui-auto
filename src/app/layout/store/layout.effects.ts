import { Effect, ofType } from '@ngrx/effects';
import { Actions } from '@ngrx/effects';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { switchMap, map, tap, catchError } from 'rxjs/operators';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as LayoutAction from './layout.actions';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Menu } from 'src/app/models/layoutModel/sidenavModel/menu.model';
import { AppConfigService } from 'src/app/services/app-config.service';

//below function is use to fetch error and return appropriate comments
const handleError = (errorRes: any) => {
    let errorMessage = 'An unknown error occurred';
    if (!errorRes.error) {
        return of(new LayoutAction.ErrorResponse(errorMessage));
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
    return of(new LayoutAction.ErrorResponse(errorMessage));
}

@Injectable()
export class LayoutEffect {
    user: any;
    constructor(public actions$: Actions<LayoutAction.LayoutActions>,
        public http: HttpClient,
        public store: Store<fromApp.AppState>,
        public router: Router,
        private environment: AppConfigService
    ) { }

    // Below effect is use for fetch sidebar data. 
    @Effect()
    fetchDynamicMenu = this.actions$.pipe(
        ofType(LayoutAction.LayoutActionTypes.LOADPAGE),
        switchMap(() => {
            return this.http.get<Menu>(this.environment.config.endPointUrl+'oes/dashboard/dynamicMenu').pipe(
                map(resData => {
                    return new LayoutAction.SideBarFetch(resData['menu']);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                })
            );
        })
    );

    // Below effect is use for fetch installation mode data. 
    @Effect()
    fetchInstallationMode = this.actions$.pipe(
        ofType(LayoutAction.LayoutActionTypes.LOADPAGE),
        switchMap(() => {
            return this.http.get<string>(this.environment.config.endPointUrl+'dashboardservice/v1/installation/installationmode').pipe(
                map(resData => {
                    return new LayoutAction.InstallationMode(resData['mode']);
                }),
                catchError(errorRes => {
                    return handleError(errorRes);
                })
            );
        })
    );

}
