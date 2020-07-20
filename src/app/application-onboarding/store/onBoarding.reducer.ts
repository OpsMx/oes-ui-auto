
import { Pipeline } from 'src/app/models/applicationOnboarding/pipelineTemplate/pipeline.model';
import { Action, createReducer, on } from '@ngrx/store';
import * as OnboardingAction from './onBoarding.actions';
import { CreateApplication } from 'src/app/models/applicationOnboarding/createApplicationModel/createApplication.model';
import { CloudAccount } from 'src/app/models/applicationOnboarding/createApplicationModel/servicesModel/cloudAccount.model';
import { ApplicationList } from 'src/app/models/applicationOnboarding/applicationList/applicationList.model';


export interface State {

    // Create Application variable
    pipelineData: Pipeline;
    erroeMessage: string;
    editMode: boolean;
    parentPage: string;
    applicationData: CreateApplication;
    applicationLoading: boolean;
    cloudAccountExist: CloudAccount;
    imageSource: string[];
    dockerImageData:any;
    callDockerImageDataAPI: boolean;

    // Application List variables
    applicationList: ApplicationList[];
    appListLoading: boolean;

    // Account variables
    accountList: any;
    datasourceList: any;
    accountParentPage: string;
    accountDeleted: boolean;
}

export const initialState: State = {
    pipelineData: null,
    erroeMessage: null,
    editMode: false,
    parentPage: '/setup/applications',
    applicationData: null,
    cloudAccountExist: null,
    applicationList: null,
    accountList: null,
    datasourceList: null,
    accountParentPage: null,
    accountDeleted: false,
    appListLoading: false,
    applicationLoading: false,
    imageSource: null,
    dockerImageData: null,
    callDockerImageDataAPI: true
}

export function AppOnboardingReducer(
    onboardingState: State | undefined,
    onboardingAction: Action) {
    return createReducer(
        initialState,
        // #### CreateApplication screen logic start ####
        on(OnboardingAction.loadApp,
            (state, action) => ({
                ...state,
                editMode:false,
                parentPage: action.page
            })
        ),
        on(OnboardingAction.fetchPipeline,
            (state, action) => ({
                ...state,
                pipelineData: action.pipelineData
            })
        ),
        on(OnboardingAction.errorOccured,
            (state,action) => ({
                ...state,
                erroeMessage:action.errorMessage,
                appListLoading: false,
                applicationLoading: false
            })
        ),
        on(OnboardingAction.enableEditMode,
            (state,action) => ({
                ...state,
                editMode:action.editMode,
                parentPage: action.page,
                applicationLoading: true
            })    
        ),
        
        on(OnboardingAction.fetchAppData,
            (state,action) => ({
                ...state,
                applicationData:action.appData,
                applicationLoading: false
            })
        ),
        on(OnboardingAction.disabledEditMode,
            state => ({
                ...state,
                editMode:false
            })
        ),
        on(OnboardingAction.createApplication,
            state => ({
                ...state,
                applicationLoading:true
            })
        ),
        on(OnboardingAction.updateApplication,
            state => ({
                ...state,
                applicationLoading:true
            })
        ),
        on(OnboardingAction.dataSaved,
            state => ({
                ...state,
                applicationLoading:false
            })
        ),
        on(OnboardingAction.fetchCloudAccount,
            (state,action) => ({
                ...state,
                cloudAccountExist:action.cloudAccount
            })
        ),
        on(OnboardingAction.fetchImageSource,
            (state,action) => ({
                ...state,
                imageSource:action.imageSource
            })
        ),
        on(OnboardingAction.loadDockerImageName,
            (state,action) => ({
                ...state,
                callDockerImageDataAPI: false
            })
        ),
        on(OnboardingAction.fetchDockerImageName,
            (state,action) => ({
                ...state,
                dockerImageData: action.dockerImageData
            })
        ),
        
        // #### CreateApplication screen logic start ####//

        // ###  Applist screen logic start ### // 
        on(OnboardingAction.loadAppList,
            state => ({
                ...state,
                appListLoading:true
            })
        ),
        on(OnboardingAction.fetchAppList,
            (state,action) => ({
                ...state,
                applicationList: action.Applist,
                appListLoading:false
            })
        ),
        on(OnboardingAction.appDelete,
            state => ({
                ...state,
                appListLoading:true
            })
        ),
        on(OnboardingAction.appDeletedSuccessfully,
            (state,action) => ({
                ...state,
                applicationList: state.applicationList.filter((applist,index) => index !== action.index),
                appListLoading:false
            })
        ),
        // ###  Applist screen logic End ### // 

        // ###  Account screen logic Starts ### // 
        on(OnboardingAction.fetchAccountList,
            (state,action) => ({
                ...state,
                accountList: action.Accountlist,
            })
        ),
        on(OnboardingAction.loadAccount,
            (state, action) => ({
                ...state,
                accountParentPage: action.page
            })
        ),
        on(OnboardingAction.deleteAccount,
            (state, action) => ({
                ...state,
                accountDeleted: false
            })
        ),
        // on(OnboardingAction.accountDeleted,
        //     state => ({
        //         ...state,
        //         accountDeleted: true
        //     })
        // ),
        on(OnboardingAction.accountDeleted,
            (state,action) => ({
                ...state,
                accountList: state.accountList.filter((accountList,index) => index !== action.index)
            })
        ),
        // ###  Account screen logic End ### // 

        // ###  Datasource screen logic start ### // 

        on(OnboardingAction.fetchDatasourceList,
            (state,action) => ({
                ...state,
                datasourceList: action.DatasourceList,
            })
        ),
        on(OnboardingAction.DatasourceaccountDeleted,
            (state,action) => ({
                ...state,
                datasourceList: state.datasourceList.filter((datasourceList,index) => index !== action.index)
            })
        ),
    )(onboardingState,onboardingAction);
}