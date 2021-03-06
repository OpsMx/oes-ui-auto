import { Action, createReducer, on } from '@ngrx/store';
import { PolicyTable } from 'src/app/models/policyManagement/policyTable.model';
import * as PolicyActions from './policyManagement.actions'
import { PolicyManagement } from 'src/app/models/policyManagement/policyManagement.model';

export interface State {
    runtimeTableData: PolicyTable[];
    compliantPipelineTableData: PolicyTable[];
    endpointTypeData: any;
    errorMessage: string;
    runtimeEditPolicyData:PolicyManagement;
    compliantPipelineEditPolicyData:PolicyManagement;
    editMode:boolean;
    readonlyMode:boolean;
    loading:boolean;
    errorMode:boolean;
}

export const initialState: State = {
    runtimeTableData: null,
    compliantPipelineTableData: null,
    endpointTypeData: null,
    errorMessage: null,
    runtimeEditPolicyData: null,
    compliantPipelineEditPolicyData: null,
    editMode: false,
    readonlyMode: true,
    loading:false,
    errorMode:false
}

export function PolicyReducer(
    policyState: State | undefined,
    policyActions: Action) {
    return createReducer(
        initialState,
        on(PolicyActions.loadTableData,
            (state, action) => ({
                ...state,
                runtimeTableData: action.TableData['runtimePolicies'],
                compliantPipelineTableData: action.TableData['compliantPipelinePolicies'],
                loading:false
            })
        ),
        on(PolicyActions.fetchEndpointType,
            (state, action) => ({
                ...state,
                endpointTypeData: action.endpointType
            })
        ),
        on(PolicyActions.errorOccured,
            (state, action) => ({
                ...state,
                errorMessage: action.errorMessage,
                readonlyMode:false,
                loading:false
            })
        ),
        on(PolicyActions.dynamicPolicSuccessfullSubmission,
            (state,action) => ({
                ...state,
                errorMessage: null,
                readonlyMode:action.readonly,
                runtimeEditPolicyData:action.DynamicPolicyData,
                editMode:action.editMode,
                errorMode:action.errorMode
            })
        ),
        on(PolicyActions.staticPolicySuccessfullSubmission,
            (state,action) => ({
                ...state,
                errorMessage: null,
                readonlyMode:action.readonly,
                compliantPipelineEditPolicyData:action.StaticPolicyData,
                editMode:action.editMode,
                errorMode:action.errorMode
            })
        ),
        on(PolicyActions.editPolicy,
            (state,action) => ({
                ...state,
                editMode: action.editMode,
                readonlyMode: action.readonlyMode,
                loading:true,
                errorMode:false
            })
        ),
        on(PolicyActions.fetchedDynamicPolicyData,
            (state,action) => ({
                ...state,
                runtimeEditPolicyData: action.DynamicPolicyData,
                loading:false
            })
        ),
        on(PolicyActions.fetchedStaticPolicyData,
            (state,action) => ({
                ...state,
                compliantPipelineEditPolicyData: action.StaticPolicyData,
                loading:false
            })
        ),
        on(PolicyActions.createPolicy,
            (state,action) => ({
                ...state,
                readonlyMode:false,
                editMode:false,
                errorMode:false
            })
        ),
        on(PolicyActions.changeTab,
            state => ({
                ...state,
                readonlyMode:true,
                editMode:false,
                errorMode:false
            })
        ),
        on(PolicyActions.savePolicy,
            (state) => ({
                ...state,
                loading:true
            })
        ),
    )(policyState,policyActions);
}