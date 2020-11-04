import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef, Renderer2 } from '@angular/core';
import { FormGroup, Validators, FormControl, FormArray, FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { SharedService } from 'src/app/services/shared.service';
import { PipelineTemplate } from '../../../models/applicationOnboarding/pipelineTemplate/pipelineTemplate.model';
import { Pipeline } from '../../../models/applicationOnboarding/pipelineTemplate/pipeline.model';
import { Store } from '@ngrx/store';
import * as fromFeature from '../../store/feature.reducer';
import * as fromApp from '../../../store/app.reducer';
import { CreateApplication } from 'src/app/models/applicationOnboarding/createApplicationModel/createApplication.model';
import * as ApplicationActions from '../store/application.actions';
import { CloudAccount } from 'src/app/models/applicationOnboarding/createApplicationModel/servicesModel/cloudAccount.model';
import { Service } from 'src/app/models/applicationOnboarding/createApplicationModel/servicesModel/serviceModel';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import * as $ from 'jquery';
import { GroupPermission } from 'src/app/models/applicationOnboarding/createApplicationModel/groupPermissionModel/groupPermission.model';
import { SaveApplication } from 'src/app/models/applicationOnboarding/createApplicationModel/saveApplicationModel';
import { Environment } from 'src/app/models/applicationOnboarding/createApplicationModel/environmentModel/environment.model';
import {Visibility } from 'src/app/models/applicationOnboarding/createApplicationModel/visibilityModel/visibility.model';
import { AppPage } from 'e2e/src/app.po';
import { JsonEditorComponent, JsonEditorOptions } from 'ang-jsoneditor';

@Component({
  selector: 'app-application',
  templateUrl: './application.component.html',
  styleUrls: ['./application.component.less']
})
export class CreateApplicationComponent implements OnInit {

  @ViewChild('logModel') logModel: ElementRef;
  @ViewChild('metricModel') metricModel: ElementRef;
  @ViewChild(JsonEditorComponent, { static: false }) tooltypeTemplateEditorJson: JsonEditorComponent;
  @ViewChild('tooltypeTemplateModel') tooltypeTemplateModel: ElementRef;
  @ViewChild('newtemplate') newtemplate: ElementRef;
  

  userType = '';                                            // It contain type of user i.e, AP, OES or both.
  createApplicationForm: FormGroup;                               // For Application Section
  groupPermissionForm: FormGroup;                                 // For Permission Section
  servicesForm: FormGroup;                                        // For Services Section
  environmentForm: FormGroup;                                     // For Environment Section
  gateForm: FormGroup;                                            // For GateName Section
  visibilityForm: FormGroup;                                      // For Visibility Section
  fetchedPipelineTemplateParameters: PipelineTemplate[];          // For fetched pipeline_parameter through api used in serviceForm
  pipelineExists: Pipeline;                                       // For populating the pipeline Type dropdown exist in services section.
  mainForm: CreateApplication = null;                             // It contain data of all 3 forms which send to backend after successful submission.
  appForm: SaveApplication = null;                                // It contain data of application form
  servForm: SaveApplication = null;                                // It contain data of application form
  envForm: Environment = null;                                    // It contain data of environment form
  visForm: Visibility = null;                              // It contain data of visibilty form
  groupForm: GroupPermission = null;
  cloudAccountExist: CloudAccount;                                // It contain data of all cloud Account exist.  
  editMode: boolean = false                                       // It use to define form is in edit phase
  appData: CreateApplication = null;                              // It use to hold application fetch from api.  
  envData: Environment = null;                              // It use to hold application fetch from api.                                                                                
  editServiceForm: Service;                                       // It is use to save edit Service form data.
  parentPage: string = null;                                      // It is use to redirect the parent page after clicking cancel.
  apploading: boolean = false;                                    // It is use to show hide loading screen.
  imageSourceData = null;                                         // It is use to store imageSource dropdown data.
  environmentUpdated = false;                                     // It is use to change status of services while environment is update in edit mode.
  dockerImageData = null;                                         // It is use to store data related to dockerImage fetched from state.
  dockerImageDropdownData = [];                                   // It is use to store dockerImage dropdown data on selection of Image Source
  dockerAccountName = '';                                         // It is use to store default docker Account name.
  userGroupData = [];                                             // It is use to store array value of userGroups. 
  userGroupDropdownData = [];                                     // It is use to store userGroupDropdown data .
  logTemplateData = [];                                           // It is use to store log Template data created from json editor.
  metricTemplateData = [];                                        // It is use to store metric Template data created from json editor.
  currentLogTemplateIndex = -1;                                   // It is use to store index value of current service where user is creating log template.
  currentMetricTemplateIndex = -1;                                // It is use to store index value of current service where user is creating Metric template.
  userGroupPermissions:Object[] = [];                             // It is use to store value of checkbox need to display in group section.
  editApplicationCounter:number = 0;                              // It is use to restrict reexecuting of edit application method.
  editTemplateIndex = -1;                                         // It is use to store index value of template which user want to edit.
  templateEditMode = false;                                       // It is use to store true while user want to edit template parameter.
  editTemplateData = null;                                        // It is use to store data of template which user want to update.
  apiLoadingError = false;                                        // It is use to show or hide component error message.
  isMetricTemplateClicked = true;
  errorMessage = `<div><b>Application creation requires image source(s) and pipeline template(s).</b></div><ul><li>Please create an image source via  "Data sources" -> "New Data Source" -> Select Monitoring Provider To Create DataSource.</li><li>Pipeline template needs to be create in Spinnaker.If you are sure that these are there, Please refresh the page after some time.</li></ul>`
  featureList:any;
  exerciseAp = {
    data: [{ param: "logTemp" }, { param: "metricTemp" }]
  };
  showFeatures: boolean = false;
  userIndex: any;
  showDat: boolean;

  savedApplicationData: any;
  applicationId : number;
  savedServiceData :any;
  serviceId : string;

  //visibility
  gateData : any;
  gateId : any;
  approvalGatesList : any;
  isEditGateEnabled : boolean = false;
  configuredToolTypes : any;
  templatesForToolType : any;
  accountsForTooltypes : any;
  selectedTTTemplateTab ='tooltype-template-form';
  public tooltypeTemplateEditor: JsonEditorOptions;   
  public tooltypeTemplateData: any = null;
  templateId : any = [];
  connectorId: any;
  approvalGatesOfaServiceList : any;


  showserviceGroup:boolean;
  configuredFeature  =[]
  isFeaturePresent = []
  
  todo = [
    'Get to work',
    'Pick up groceries',
    'Go home',
    'Fall asleep'
  ];

  done = [
   
  ];
  selectedFeature=[];
  toolTemplateForm: FormGroup;
  toolTypeRowHoverd: any = [];
  
  constructor(public sharedService: SharedService,
              public store: Store<fromFeature.State>,
              public appStore: Store<fromApp.AppState>,
              public router: Router,
              private formBuilder: FormBuilder,
              private render: Renderer2,
              private eleRef: ElementRef) { }

  ngOnInit() {
    this.showserviceGroup=true;
    this.gateId = "";

    this.showDat = false;
    // Reseting metric and log Templates data
    this.store.dispatch(ApplicationActions.resetTemplateData());

    // Below function is use to fetch data from AppState to update usertype
    this.appStore.select('layout').subscribe(
      (layoutRes) => {
        // if(layoutRes.installationMode !== ''){
        //   this.userType = layoutRes.installationMode;
        //   if(this.userType.includes('OES')){
        //     //Dispatching action to load initial oes data to populate dropdown
        //     this.store.dispatch(ApplicationActions.loadOESData());
        //   }
        // }
        if(layoutRes.supportedFeatures != null){       
          //this.featureList = ["sapor","deployment_verification","visibility"];
          this.featureList = layoutRes.supportedFeatures;
          const saporExist = this.featureList.some(item => item.includes("sapor"));
          if(saporExist){
            this.store.dispatch(ApplicationActions.loadOESData());
            this.userType = this.featureList[0];
          }
           //this.saporExist = saporExist;
          
         // if(this.featureList.some(item => item.includes('Deployment Verification'))){
          //  this.userType = 'Deployment Verification';
            //Dispatching action to load initial oes data to populate dropdown
          //  this.store.dispatch(ApplicationActions.loadOESData());
         // }
        }
      }
    )

    // fetching data from store and check editMode mode is enable or disabled
    this.store.select(fromFeature.selectApplication).subscribe(
      (responseData) => {
        //this.apploading = responseData.applicationLoading;
        this.parentPage = responseData.parentPage;

        if(responseData.initalOESDatacall === true && this.userType.includes('sapor')){
          let counter = 0;
          if(responseData.initalOESDataLoaded.indexOf('calling') > -1){
            //this.apploading = true;
          }else{
            //this.apploading = false;
          }
          responseData.initalOESDataLoaded.forEach(data=>{
            if(data === 'error'){
              counter++;
            }
          })
          if(counter > 0){
            this.apiLoadingError = true;
          }else{
            this.apiLoadingError = false;
          }
        }
        
        //checking is editMode enabled
        if (responseData.editMode && this.editApplicationCounter === 0) {
          
          this.appData = responseData.applicationData;
          this.editMode = responseData.editMode;
          this.defineAllForms();

          if (responseData.applicationData !== null) {
            this.editApplicationCounter++;
            // Reseting metric and log Templates data
            this.store.dispatch(ApplicationActions.resetTemplateData());
            //populating createApplicationForm ################################################################
            if(this.userType === 'deployment_verification'){
              // AP mode
              this.createApplicationForm = new FormGroup({
                name: new FormControl(this.appData.name),
                emailId: new FormControl(this.appData.emailId, [Validators.required,Validators.email]),
                description: new FormControl(this.appData.description),
                lastUpdatedTimestamp: new FormControl(this.appData.lastUpdatedTimestamp)
              });
            }else{
              // user belongs to OES mode also.
              this.createApplicationForm = new FormGroup({
                name: new FormControl(this.appData.name),
                emailId: new FormControl(this.appData.emailId, [Validators.required,Validators.email]),
                description: new FormControl(this.appData.description),
                imageSource: new FormControl(this.appData.imageSource, Validators.required),
                lastUpdatedTimestamp: new FormControl(this.appData.lastUpdatedTimestamp)
              });
              //populating dockerImagenamedropdown.
              if(responseData.callDockerImageDataAPI){
                this.onImageSourceSelect(this.appData.imageSource);
              }
            }
            if(this.editMode)
            {
              
              this.showserviceGroup=false;
              var totalServices = this.appData.services.length
              this.servicesForm = new FormGroup({
                services: new FormArray([])
               });
               for(let i =0;i<totalServices;i++)
               {
                (<FormArray>this.servicesForm.get('services')).push(
                               new FormGroup({
                                 serviceName: new FormControl({value: this.appData.services[i].serviceName, disabled: true}),
                                })
                )
                this.configuredFeature.push({
                  "configuredFeatures": [
                      "deployment_verification",
                      "sapor",
                      "visibility"
                  ]
              }
              )
              this.selectFeature(this.featureList[0],i)
               }
                 this.configuredFeaturepresent(totalServices)
            }
            

            //populating serviceForm ############################################################################
            // if (this.appData.services !== null && this.appData.services.length !== 0) {
            //   this.servicesForm = new FormGroup({
            //     services: new FormArray([])
            //   });
            //   switch(this.userType){
            //     case 'OES':
            //     case 'OES-AP':
            //       //populating services array in OES mode
            //       this.appData.services.forEach((serviceArr, serviceindex) => {
            //         if(this.userType === 'OES-AP'){
            //           (<FormArray>this.servicesForm.get('services')).push(
            //             new FormGroup({
            //               serviceName: new FormControl({value: serviceArr.serviceName, disabled: true}),
            //               id: new FormControl(serviceArr.id),
            //               logTemp: new FormControl(serviceArr.logTemp),
            //               metricTemp: new FormControl(serviceArr.metricTemp),
            //               pipelines: new FormArray([])
            //             })
            //           );
            //         }else{
            //           (<FormArray>this.servicesForm.get('services')).push(
            //             new FormGroup({
            //               serviceName: new FormControl({value: serviceArr.serviceName, disabled: true}),
            //               id: new FormControl(serviceArr.id),
            //               pipelines: new FormArray([])
            //             })
            //           );
            //         }
                    
            //         //populating pipeline array
            //         serviceArr.pipelines.forEach((pipelineArr, pipelineIndex) => {
            //           const serviceArray = this.servicesForm.get('services') as FormArray;
            //           const pipelineArray = serviceArray.at(serviceindex).get('pipelines') as FormArray;
            //           pipelineArray.push(
            //             new FormGroup({
            //               pipelinetemplate: new FormControl(pipelineArr.pipelinetemplate, Validators.required),
            //               dockerImageName: new FormGroup({
            //                 accountName: new FormControl(pipelineArr.dockerImageName.accountName, Validators.required),
            //                 imageName: new FormControl(pipelineArr.dockerImageName.imageName, Validators.required)
            //               }),
            //               pipelineParameters: new FormArray([])
            //             })
            //           )
            //           if(pipelineArr.pipelineParameters !== null && pipelineArr.pipelineParameters !== undefined){
            //             //populating pipelieParameter array
            //             pipelineArr.pipelineParameters.forEach(pipelineParameterArr => {
            //               const pipelineParameter = pipelineArray.at(pipelineIndex).get('pipelineParameters') as FormArray;
            //               pipelineParameter.push(
            //                 new FormGroup({
            //                   value: new FormControl(pipelineParameterArr.value),
            //                   name: new FormControl(pipelineParameterArr.name),
            //                   type: new FormControl(pipelineParameterArr.type)
            //                 })
            //               );
            //             })
            //           }
            //         })
            //       })
            //       break;
            //     case 'AP':
            //       //populating services array in OES mode
            //       this.appData.services.forEach(serviceArr => {
            //         (<FormArray>this.servicesForm.get('services')).push(
            //           new FormGroup({
            //             serviceName: new FormControl({value: serviceArr.serviceName, disabled: true}),
            //             id: new FormControl(serviceArr.id),
            //             logTemp: new FormControl(serviceArr.logTemp),
            //             metricTemp: new FormControl(serviceArr.metricTemp)
            //           })
            //         );
            //       });
            //       break;
            //   }
            // }

            //populate environment Form if usertype include OES in it#################################################################################
            if(this.appData.environments !==null){
              if (this.appData.environments.length !== 0 && this.userType !== 'deployment_verification') {
                // clearing form first
                this.environmentForm = new FormGroup({
                  environments: new FormArray([])
                });
                this.appData.environments.forEach(environmentdata => {
                  (<FormArray>this.environmentForm.get('environments')).push(
                    new FormGroup({
                      key: new FormControl(environmentdata.key, Validators.required),
                      value: new FormControl(environmentdata.value),
                      id: new FormControl(environmentdata.id)
                    })
                  );
                })
              }
            }
            

            //populate groupPermission Form #############################################################################
            if (this.appData.userGroups !==null && this.appData.userGroups.length !== 0) {
              // clearing form first
              this.groupPermissionForm = new FormGroup({
                userGroups: new FormArray([])
              });
              //populating the form
              const userGroupControl = this.groupPermissionForm.get('userGroups') as FormArray;
              this.appData.userGroups.forEach((groupData,index) => {
                // pushing controls in usergroup form.
                userGroupControl.push(
                  new FormGroup({
                    userGroupId: new FormControl(groupData.userGroupId,[Validators.required,this.usergroupExist.bind(this)]),
                    permissionIds: new FormArray([])
                  })
                );

                // pushing controls in permissionIDs
                const permissionIdGroupControl = userGroupControl.at(index).get('permissionIds') as FormArray;
                this.populatePermissions(permissionIdGroupControl,groupData.permissionIds);
              })
            }

            //populating log and metric template data ######################################################################
            if(this.userType === 'deployment_verification'){
              // Storing Log and Metric template data in state getting from appData
              if(this.appData.logTemplate !== null){
                this.appData.logTemplate.forEach(logTemp => {
                  this.store.dispatch(ApplicationActions.createdLogTemplate({logTemplateData:logTemp}))
                });
              }
              if(this.appData.metricTemplate !== null){
                this.appData.metricTemplate.forEach(metricTemp => {
                  this.store.dispatch(ApplicationActions.createdMetricTemplate({metricTemplateData:metricTemp}));
                });
              }
            }
          }else{
            this.defineAllForms();
          }
        } else if (this.appData === null && this.imageSourceData === null) {
          // defining all forms when not in edit mode
          if(this.createApplicationForm === undefined && this.servicesForm === undefined){
            this.defineAllForms();
          }
        }
      }
    )

    // Below function is use to fetching data from state related to pipelineData
    this.store.select(fromFeature.selectApplication).subscribe(
      (response) => {        
        if (response.pipelineData !== null) {
          this.pipelineExists = response.pipelineData;
        }
        if (response.imageSource !== null) {
          this.imageSourceData = response.imageSource;
        }
        if(response.savedApplicationData != null){
          this.savedApplicationData = response.savedApplicationData;
          this.applicationId = this.savedApplicationData.applicationId;
          //Response Json sample format
          // {
          //   "applicationId": "50",
          //   "lastUpdatedTimestamp": "Fri Oct 30 09:39:07 UTC 2020",
          //   "name": "xdsad",
          //   "email": "meera@opsmx.io",
          //   "description": "",
          //   "imageSource": "docker.io/opsmx11",
          //   "services": []
          // }
        }
        if(response.savedServiceData != null){
          this.savedServiceData = response.savedServiceData;
          this.serviceId = this.savedServiceData.id;
          //Respose json sample format
          // {
          //   "id": 19,
          //   "name": "paymentservice",
          //   "applicationId": 53
          // }
        }
        if (response.dockerImageData !== null && response.dockerImageData !== undefined) {
          this.dockerImageData = response.dockerImageData;
          this.populateDockerImagenDropdown();
        }
        if (response.userGropsData !== null && response.userGroupsPermissions !== null) {
          this.userGroupData = response.userGropsData;
          this.userGroupPermissions = response.userGroupsPermissions;
          // populating user group dropdown data
          this.populateUserGroupsDropdown();
        }
        if (response.logtemplate.length > 0){
          this.logTemplateData = response.logtemplate;
          if(this.logModel !== undefined){
            this.logModel.nativeElement.click();
          }
          this.populateSelectedTemplateName(this.currentLogTemplateIndex,'logTemp')
        }
        if (response.metrictemplate.length > 0){
          this.metricTemplateData = response.metrictemplate;
          if(this.metricModel !== undefined){
            this.metricModel.nativeElement.click();
          }
          this.populateSelectedTemplateName(this.currentMetricTemplateIndex,'metricTemp')
        }
        if (response.approvalGateSavedData != null && response.isGateSaved) {
          this.store.dispatch(ApplicationActions.isApprovalGateSaved());
          this.gateData = response.approvalGateSavedData;
          //this.gateId = 
          //this.store.dispatch(ApplicationActions.getApprovalGates()); 
          this.addConnector();
          this.store.dispatch(ApplicationActions.getConfiguredToolConnectorTypes()); 
          //this.store.dispatch(ApplicationActions.getApprovalGatesOfaService({serviceId : this.serviceId}));      
        }
        if(response.approvalGatesList != null && response.isApprovalGatesLoaded){
          this.store.dispatch(ApplicationActions.isApprovalGatesLoaded());
          this.approvalGatesList = response.approvalGatesList;
          this.gateId = this.approvalGatesList[0].id;
          console.log(this.approvalGatesList);
          //this.addConnector();
          //this.store.dispatch(ApplicationActions.getConfiguredToolConnectorTypes());
        }
        if(response.approvalGatesListOfaService != null && response.isApprovalGatesOfaServiceLoaded){
          this.store.dispatch(ApplicationActions.isApprovalGatesOfaServiceLoaded());
          this.approvalGatesOfaServiceList = response.approvalGatesListOfaService;
          this.gateId = this.approvalGatesOfaServiceList[0].id;
          console.log(this.approvalGatesOfaServiceList);
          //this.addConnector();
          //this.store.dispatch(ApplicationActions.getConfiguredToolConnectorTypes());
        }
        if(response.isApprovalGateEdited){
          this.isEditGateEnabled = false;
          this.store.dispatch(ApplicationActions.isApprovalGateEdited());
        }
        if(response.configuredToolConnectorTypes && response.isConfiguredToolConnectorLoaded){
          this.store.dispatch(ApplicationActions.isloadedConfiguredToolConnectorTypes());
          this.configuredToolTypes = response.configuredToolConnectorTypes;
        }
        if(response.accountsForToolType && response.isAccountForToolTypeLoaded){
          this.store.dispatch(ApplicationActions.isLoadedAccountToolType());
          this.accountsForTooltypes = response.accountsForToolType;
          //this.connectorId = this.accountsForTooltypes[0];
        }
        if(response.templatesForToolType && response.isTemplateForToolTypeLoaded){
          this.store.dispatch(ApplicationActions.isLoadedTemplateToolType());
          this.templatesForToolType = response.templatesForToolType;
        }
        if(response.isTemplateForTooltypeSaved){
          this.store.dispatch(ApplicationActions.isTemplateForTooltypeSaved());
          if(this.tooltypeTemplateModel != undefined){
            this.tooltypeTemplateModel.nativeElement.click();
          }
          //this.store.dispatch(ApplicationActions.getTemplatesToolType)
        }
        
      }
    )

    //Visibility Tooltype template creation
    this.tooltypeTemplateEditor = new JsonEditorOptions()
    this.tooltypeTemplateEditor.mode = 'code';
    this.tooltypeTemplateEditor.modes = ['code', 'text', 'tree', 'view']; // set all allowed modes
  }

  // Below function is use to define all forms exist in application On boarding component
  defineAllForms() {
    // defining reactive form approach for createApplicationForm
    //if(this.userType === 'Deployment Verification'){
      // For AP mode
      this.createApplicationForm = new FormGroup({
        name: new FormControl('',[Validators.required, this.cannotContainSpace.bind(this)], this.valitateApplicationName.bind(this)),
        emailId: new FormControl('',[Validators.required,Validators.email]),
        imageSource: new FormControl(''),
        description: new FormControl('')
      });
   // }else{
      // For OES and both oes and autopilot mode.
      // this.createApplicationForm = new FormGroup({
      //   name: new FormControl('',[Validators.required, this.cannotContainSpace.bind(this)], this.valitateApplicationName.bind(this)),
      //   emailId: new FormControl('',[Validators.required,Validators.email]),
      //   description: new FormControl(''),
      //   imageSource: new FormControl('',Validators.required)
      // });
  //  }

    // defining reactive form for Services Section
    this.servicesForm = new FormGroup({
      services: new FormArray([this.setServiceForm()])
    });

    // defining reactive form for Permission Section
    this.groupPermissionForm = new FormGroup({
      userGroups: new FormArray([])
    });

    // defining reactive form for Environment Section
    this.environmentForm = new FormGroup({
      environments: new FormArray([])
    });

     // defining reactive form for Visibility Gate Section
    this.gateForm = new FormGroup({
        gateName: new FormControl('', [Validators.required,this.cannotContainSpace.bind(this)]),
       });

  
  }
  
  //Below function is custom valiadator which is use to validate application name through API call, if name is not exist then it allows us to proceed.
  valitateApplicationName(control: FormControl): Promise<any> | Observable<any> {
    const promise = new Promise<any>((resolve, reject) => {
      this.sharedService.validateApplicationName(control.value, 'application').subscribe(
        (response) => {
          if (response['applicationExist'] === true) {
            resolve({ 'applicationExist': true });
          } else {
            resolve(null);
          }
        },
        // below contain remove when name check api is implemented
        (error)=>{
          resolve(null);
        }
      )
    });
    return promise;
  }

  // Below function is use to populate permission in usergroup in edit mode
  populatePermissions(formControl,assignedpermission){
    setTimeout(()=>{
      if(this.userGroupPermissions.length > 0){
        this.userGroupPermissions.forEach(permissionId => {
          if(assignedpermission.indexOf(permissionId['permissionId']) > -1){
            formControl.push(
              new FormGroup({
                value: new FormControl(true),
                name: new FormControl(permissionId['permissionId'])
              })
            )
          }else{
            formControl.push(
              new FormGroup({
                value: new FormControl(false),
                name: new FormControl(permissionId['permissionId'])
              })
            )
          }
          
        })
      }else {
        this.populatePermissions(formControl,assignedpermission);
      }
    },500)
  }

  // Below function is use to return relavent service form on basics of userType. i.e,AP , OESOnly or both.
  setServiceForm(){
    let serviceForm = null;
    serviceForm =  new FormGroup({
      serviceName: new FormControl('', [Validators.required,this.cannotContainSpace.bind(this)]),
      featureName: new FormControl(''),
    })
    
   return serviceForm;

  }

  //Below function is custom valiadator which is use to validate inpute contain space or not. If input contain space then it will return error
  cannotContainSpace(control: FormControl): {[s: string]: boolean} {
  if(control.value !== null){
    let startingValue = control.value.split('');
    if(startingValue.length > 0 && (control.value as string).indexOf(' ') >= 0){
      return {containSpace: true}
    }
    if( +startingValue[0] > -1 && startingValue.length > 0){
      return {startingFromNumber: true}
    }
    if ( !/^[^`~!@#$%\^&*()_+={}|[\]\\:';"<>?,./]*$/.test(control.value)) {
      return {symbols: true};
    }
  }
  return null;
  }

  // Below function is custom valiadator which is use to validate userGroup name is already selected or not. If already exist then it will return error
  usergroupExist(control: FormControl): {[s: string]: boolean} {
    if(control.value !== null){
      let counter = 0;
      if(+control.value > 0 && typeof(control.value) !== 'number'){
        this.groupPermissionForm.value.userGroups.forEach(groupName => {
          if(+groupName.userGroupId === +control.value){
            counter++;
          }
        })
      }
      if(counter > 0){
        return {groupNameExist: true}
      }
    }
    return null;
  }

  //Below function is use to populate docker image name dropdown 
  populateDockerImagenDropdown(){
    
    this.dockerImageDropdownData = [];
    if(this.editMode){
      this.servicesForm.value.services.forEach((service,SerIndex) => {
        this.dockerImageData.forEach((docker,imgIndex) => {
          if(service.pipelines[0].dockerImageName.accountName === docker.imageSource){
            this.dockerImageDropdownData[SerIndex] = this.dockerImageData[imgIndex].images;
          }
        });
      })
    }else{
      this.dockerAccountName = this.dockerImageData[0].imageSource;
      const arrayControl = this.servicesForm.get('services') as FormArray;
      if(arrayControl != undefined && arrayControl != null){
        const innerarrayControl = arrayControl.at(0).get('pipelines') as FormArray;
        if( innerarrayControl!= undefined && innerarrayControl != null){
          const mainData = innerarrayControl.at(0).get('dockerImageName');
          if(mainData != undefined && mainData != null){
            mainData.patchValue({
              'accountName': this.dockerImageData[0].imageSource
            });
          }         
        }        
      }     
      this.servicesForm.value.services.forEach(() => {
        this.dockerImageDropdownData.push(this.dockerImageData[0].images);
      })
    }
  }

   //Below function is use to populate UserGroup dropdown exist in user group section. 
   populateUserGroupsDropdown(){
    this.userGroupDropdownData = [];
    this.groupPermissionForm.value.userGroups.forEach((groupName,index) => {
      if(index<1){
        this.userGroupDropdownData.push(this.userGroupData);
      }else{
        this.userGroupDropdownData[index] = this.userGroupDropdownData[index-1].filter(el => el.userGroupId !== +this.groupPermissionForm.value.userGroups[index-1].userGroupId);
      }
    })
  }

  // Below function is use to populate Docker Image name dropdown after selecting ImageSourceData
  onImageSourceSelect(ImageSourceValue){
    this.store.dispatch(ApplicationActions.loadDockerImageName({imageSourceName:ImageSourceValue}));
  }

  // Below function is use to populate Docker Image name dropdown after selecting DockerAccountName
  onChangeDockerAcc(event,serviceIndex){
    this.dockerImageData.forEach(imageName => {
      if(imageName.imageSource === event.target.value){
        this.dockerImageDropdownData[serviceIndex] = imageName.images;
      }
    })
  }

  // Below function is use to populate newley created template into appropriate service field
  populateSelectedTemplateName(index,type){
    if(index > -1){
      const arrayControl = this.servicesForm.get('services') as FormArray;
      const innerarrayControl = arrayControl.at(index).get(type) 
      if(this.userType.includes('deployment_verification')){
        if(type === 'logTemp'){
          if(this.templateEditMode){
            innerarrayControl.patchValue(this.logTemplateData[this.editTemplateIndex].templateName);
          }else{
            innerarrayControl.patchValue(this.logTemplateData[this.logTemplateData.length-1].templateName);
          }
        }else{
          if(this.templateEditMode){
            innerarrayControl.patchValue(this.metricTemplateData[this.editTemplateIndex].templateName);
          }else{
            innerarrayControl.patchValue(this.metricTemplateData[this.metricTemplateData.length-1].templateName);
          }
        }
      }
    }
  }

  // Below function is use to return proper group value
  groupProperties(name,props){
    let prop = '';
    if(name){
      this.userGroupData.forEach(group => {
        if(group.userGroupId === +props){
          prop = group.userGroupName;
        }
      })
    }else{
      props.forEach((permission,index) => {
        if(permission.value === true){
          prop +=  prop === '' ? permission.name : ','+permission.name;
        }
      });
    }
    return prop;
  }

  // Below function is use to check whether permission is selected or not after selection of usergroup.
  permissionContrlValid(controlvalue){
    let counter = 0;
    controlvalue.value.forEach(permission => {
      if(permission.value === true){
        counter++;
      }
    });
    if(counter > 0){
      controlvalue.setErrors(null);
    }else{
      controlvalue.setErrors({'incorrect': true});
    }
    return counter > 0 ? false : true;
  } 

  //Below function is use to add more permission group
  addGroup() {
    const index = this.groupPermissionForm.value.userGroups.length > 0 ? this.groupPermissionForm.value.userGroups.length : 0;
    // pushing controls in usergroup form.
    const userGroupControl = this.groupPermissionForm.get('userGroups') as FormArray;
    userGroupControl.push(
      new FormGroup({
        userGroupId: new FormControl('',[Validators.required,this.usergroupExist.bind(this)]),
        permissionIds: new FormArray([])
      })
    );

    // pushing controls in permissionIDs
    const permissionIdGroupControl = userGroupControl.at(index).get('permissionIds') as FormArray;
    this.userGroupPermissions.forEach(permissionId => {
      permissionIdGroupControl.push(
        new FormGroup({
          value: new FormControl(false),
          name: new FormControl(permissionId['permissionId'])
        })
      )
    })
    
    // populating user group dropdown data
    this.populateUserGroupsDropdown();
  }

  // Below function is use to remove exist permission group 
  removeGroup(index) {
    $("[data-toggle='tooltip']").tooltip('hide');
    (<FormArray>this.groupPermissionForm.get('userGroups')).removeAt(index);
    // updating user group dropdown data
    this.populateUserGroupsDropdown();
  }

  //Below function is use to add more permission group
  addEnvironment() {
    (<FormArray>this.environmentForm.get('environments')).push(
      new FormGroup({
        key: new FormControl('', Validators.required),
        value: new FormControl(''),
      })
    );
  }

  // Below function is use to remove exist environment 
  removeEnvironment(index) {
    $("[data-toggle='tooltip']").tooltip('hide');
    (<FormArray>this.environmentForm.get('environments')).removeAt(index);
  }

  //Below function is use to add more permission group
  addConnector() {
    (<FormArray>this.visibilityForm.get('visibilityConfig')).push(
      new FormGroup({
        connectorType: new FormControl('', Validators.required),
        accountName: new FormControl(''),
        templateName: new FormControl(''),
      })
    );
    this.toolTypeRowHoverd.push(false);
  }

  // Below function is use to remove exist environment 
  removeConnector(index) {
    $("[data-toggle='tooltip']").tooltip('hide');
    (<FormArray>this.visibilityForm.get('visibilityConfig')).removeAt(index);
  }

  // Below function is execute on select of pipeline type in Services Section
  onPipelineSelect(service_index: number, pipeline_parameter_index: number, selectedTemplate: string) {

    const arrayControl = this.servicesForm.get('services') as FormArray;
    const innerSaporConfig = arrayControl.at(service_index).get('saporConfiguration') as FormGroup;

    const innerarrayControl = innerSaporConfig.get('pipelines') as FormArray;
    const mainData = innerarrayControl.at(pipeline_parameter_index).get('pipelineParameters') as FormArray;

    //clearing existing element of array
    mainData.clear();

    // Fetching pipeline parameters from pipelineExist object and place it in appropriate position
    for (const key in this.pipelineExists) {
      if (this.pipelineExists[key].name === selectedTemplate) {
        this.pipelineExists[key].variables.forEach(templateData => {
          mainData.push(
            new FormGroup({
              value: new FormControl(''),
              name: new FormControl(templateData.name),
              type: new FormControl(templateData.type)
            })
          );
        });
      }
    }
  }

  //Below function is use to add new service in existing Service Section
  addService() {
   // (<FormGroup>this.servicesForm.get('services')).push(this.setServiceForm());

    (<FormArray>this.servicesForm.get('services')).push(this.setServiceForm());
    // Update dockerImageDropdownData array
  //   //if(this.userType.includes('Sapor')){
  //     this.dockerImageDropdownData.push(this.dockerImageData[0].images);
  //     const arrayControl = this.servicesForm.get('services') as FormArray;
  //     const innerarrayControl = arrayControl.at(this.servicesForm.value.services.length-1).get('pipelines') as FormArray;
  //     const mainData = innerarrayControl.at(0).get('dockerImageName');
  //     mainData.patchValue({
  //         'accountName': this.dockerImageData[0].imageSource
  //     });
  // //  }
  }

  //Below function is use to delete existing service fron Service Section
  deleteService(index) {
    $("[data-toggle='tooltip']").tooltip('hide');
    (<FormArray>this.servicesForm.get('services')).removeAt(index);
     // Update dockerImageDropdownData array
     this.dockerImageDropdownData.splice(index, 1);
  }
  
  //valid all form data if something is left
  validForms() {
    // displaying error on reqd field which is invalid
    this.createApplicationForm.markAllAsTouched();
    this.servicesForm.markAllAsTouched();
    this.environmentForm.markAllAsTouched();
    this.groupPermissionForm.markAllAsTouched();
  }

  // Below function is execute after click on add template btn.
  onAddTemplate(index,type){
    $("[data-toggle='tooltip']").tooltip('hide');
    this.templateEditMode = false;
    if(type === "log"){
      this.currentLogTemplateIndex = index;
    }else{
      this.currentMetricTemplateIndex = index;
      this.isMetricTemplateClicked = !this.isMetricTemplateClicked;
    }
  }

  // Below function is execute after click on edit template btn.
  onEditTemplate(index,type){
    $("[data-toggle='tooltip']").tooltip('hide');
    this.editTemplateIndex = -1;
    this.currentLogTemplateIndex = -1;
    this.currentMetricTemplateIndex = -1;
    const serviceArrayControl = this.servicesForm.get('services') as FormArray;
    const templatControl = serviceArrayControl.at(index);
    if(type === "log" && templatControl.value.logTemp !== ""){
      this.templateEditMode = true;
      this.currentLogTemplateIndex = index;
      this.logTemplateData.forEach((logdata,index)=>{
       // if(templatControl.value.logTemp === logdata.templateName){
          this.editTemplateIndex = index;
          this.editTemplateData = {...logdata};
       // }
      })
    }else if(type === "metric" && templatControl.value.metricTemp !== ""){
      this.templateEditMode = true;
      this.currentMetricTemplateIndex = index;
      this.metricTemplateData.forEach((metricData,index)=>{
        if(templatControl.value.metricTemp === metricData.templateName){
          this.editTemplateIndex = index;
          this.editTemplateData = {...metricData};
        }
      })
    }
  }

  //Below function is use to fetch proper value from pipelineExist array and return in result in string format. i.e, related to pipeline templateParameter section
  getProperValue(serviceIndex, pipelineIndex, pipelineTemplateIndex) {
    const pipelineServiceName = this.servicesForm.value.services[serviceIndex].saporConfiguration.pipelines[pipelineIndex].pipelinetemplate;
    let placeholder = ''
    for (const key in this.pipelineExists) {
      if (this.pipelineExists[key].name === pipelineServiceName) {
        placeholder = this.pipelineExists[key].variables[pipelineTemplateIndex].defaultValue;
        return placeholder;
      }
    }
    return placeholder
  }

  // Below function is use to redirect to parent page after click on cancel btn
  cancelForm(){
    if(this.editMode){
      this.createApplicationForm.reset();
      this.environmentForm.reset();
      this.servicesForm.reset();
      this.groupPermissionForm.reset();
    }
    this.router.navigate([this.parentPage]);
  }

  // Below function is use to submit applicatio form
  SubmitApplicationForm(){
    console.log(this.createApplicationForm.value);
    this.appForm = this.createApplicationForm.value;
    if(this.createApplicationForm.value.name){
      this.showFeatures = true;
    }
      //Below action is use to save created form in database
      if(this.editMode){
       // this.store.dispatch(ApplicationActions.updateApplication({appData:this.appForm}));
      }else{
        this.store.dispatch(ApplicationActions.saveApplication({applicationData:this.appForm}));
      }
  }

  // Below function is use to save service form
  saveServiceForm(index){
    console.log(this.servicesForm.value.services[index].serviceName);
    this.servForm = this.servicesForm.value.services[index];
    var serviceDataToSave = {
      "name" : this.servicesForm.value.services[index].serviceName
    };
    this.store.dispatch(ApplicationActions.saveService({applicationId : this.applicationId,serviceSaveData:serviceDataToSave}));
  }

   // Below function is use to submit environments form
   SubmitEnvironmentsForm(){
    console.log(this.environmentForm.value);
    this.envForm = this.environmentForm.value.environments;
    if(this.createApplicationForm.value.name){
      this.showFeatures = true;
      //this.envForm = this.environmentForm.value.environments;

    }
    if(this.editMode && this.environmentForm.valid){
      //if(this.userType.includes('Sapor')){
        this.store.dispatch(ApplicationActions.saveEnvironments({environmentsData:this.envForm}));
     // }
    }else{
      this.store.dispatch(ApplicationActions.saveEnvironments({environmentsData:this.envForm}));
    }
  }

  // Below function is use to submit group permission form
  SubmitGroupPermissionForm(){
    this.groupForm = this.groupPermissionForm.value.userGroups;
    console.log(this.groupPermissionForm.value.userGroups);   
    this.store.dispatch(ApplicationActions.saveGroupPermissions({groupPermissionData:this.groupForm}));

  }

  // Below funcion is use to submit sapor data
  SubmitSaporForm(serviceIndex){
    
    console.log(JSON.stringify(this.servicesForm.value.services[serviceIndex]));
    const postSapor = {
      applicationId : this.applicationId,
      serviceId : this.serviceId,
      service: {
        serviceName : this.servicesForm.value.services[serviceIndex].serviceName,
        pipelines : this.servicesForm.value.services[serviceIndex].saporConfiguration['pipelines']
      }
    }

    console.log(JSON.stringify(postSapor));

    this.store.dispatch(ApplicationActions.saveSaporConfig({saporConfigData : postSapor}));



  }

  // Below function is use to save each connector
  saveConnector(index){
    console.log(this.visibilityForm.value.visibilityConfig[index]);
    var dataToSaveToolConnectorwithTemplate = {
      templateId : this.templateId[index]
    };
    this.store.dispatch(ApplicationActions.saveToolConnectorWithTemplate({gateId: this.gateId, connectorId : this.connectorId, toolconnectorwithTemplateData : dataToSaveToolConnectorwithTemplate}));
  }

  // Bewlow function is use to submit visibility form
  SubmitVisibilityForm(){
    console.log(this.visibilityForm.value);
  }

  // Below function is use to submit visibility gate data
  saveGateForm(){
    console.log(this.gateForm.value.gateName);
    //json to save approvalGate
    // {
    //   "id": 1,
    //   "name": "OES Production Gate",
    //   "serviceId": 1
    // }
    var gateData = {
      "name" : this.gateForm.value.gateName,
      "serviceId" : this.serviceId
    }
    this.store.dispatch( ApplicationActions.saveApprovalGate({approvalGateData : gateData}));
    //this.store.dispatch(ApplicationActions.getApprovalGates());  
  }

  //Below function is use to submit whole form and send request to backend
  SubmitForm() {
      if (this.createApplicationForm.valid && this.servicesForm.valid && this.groupPermissionForm.valid) {

        // Saving all 4 forms data into one
        this.mainForm = this.createApplicationForm.value;
        // Below is configuration related to service section when userType contain OES.
        if(this.userType.includes('sapor')){
          this.servicesForm.getRawValue().services.forEach((ServiceArr, i) => {
            ServiceArr.pipelines.forEach((PipelineArr, j) => {
              PipelineArr.pipelineParameters.forEach((DataArr, k) => {
                if (DataArr.value === '') {
                  DataArr.value = this.getProperValue(i, j, k)
                }
              })
            })
          })
        }
        
        this.mainForm.services = this.servicesForm.getRawValue().services;
        // usergroups section
        this.mainForm.userGroups = this.groupPermissionForm.value.userGroups.map(usergroupData => {
          let usergroupObj:GroupPermission = {
            userGroupId: usergroupData.userGroupId,
            permissionIds:[]
          }
          usergroupData.permissionIds.forEach(permission => {
            if(permission.value === true){
              usergroupObj.permissionIds.push(permission.name);
            }
          });
          return usergroupObj;
        });

        if(this.userType.includes('sapor')){
          this.mainForm.environments = this.environmentForm.value.environments;
        }
        if(this.userType.includes('deployment_verification')){
          this.mainForm.logTemplate = this.logTemplateData;
          this.mainForm.metricTemplate = this.metricTemplateData;
        }
        
        //Below action is use to save created form in database
        if(this.editMode){
          this.store.dispatch(ApplicationActions.updateApplication({appData:this.mainForm}));
        }else{
          this.store.dispatch(ApplicationActions.createApplication({appData:this.mainForm}));
        }
        
      } else {
        this.validForms();
      }
  }

  // Below function is use to get the feature type
  
  selectFeature(item,index){
    this.selectedFeature[index] = item;
    this.userIndex = index;
    // let autopilotParams = {
    //   data: [{deploymentverification: true, name: "logTemp",type: 'form-control', validation: ['required'] }, { name: "metricTemp",type: 'form-control',validation: ['required']  }]
    // };
    
    // let saporParams = {
    //   data: [{sapor: true,name: "pipelines", type: 'form-array', validation: ['required']}]
    // }

  

    if(item === 'deployment_verification'){
    //   this.userType = item;
    //   const arrayControl = this.servicesForm.get('services') as FormArray;
    //   const innerarrayControl = arrayControl.at(index).get('configurations') as FormGroup;
    //  autopilotParams.data.forEach(param => {
    //     if(param.type == 'form-control'){
    //       innerarrayControl.addControl( param.name, new FormControl(''));
    //     }else{
    //     }
    //   });

    }else if(item === 'sapor'){
      const saporForm =  new FormGroup({
        pipelines: new FormArray([
        new FormGroup({
          pipelinetemplate: new FormControl('', Validators.required),
          dockerImageName: new FormGroup({
            accountName: new FormControl('', Validators.required),
            imageName: new FormControl('', Validators.required)
          }),
          pipelineParameters: new FormArray([])
        })
      ])
    });
      this.userType = item;
      const arrayControl = this.servicesForm.get('services') as FormArray;
      const innerarrayControl = arrayControl.at(index) as FormGroup;
      innerarrayControl.addControl('saporConfiguration',  saporForm);

      
    }else if(item === 'visibility'){

    // defining reactive form for Visibility connector template Section

     this.visibilityForm = new FormGroup({
      visibilityConfig: new FormArray([])
    });


    }
  
 
  }


// refactor code functions goes here

getApplicationDetails(){
  
}



// selectFeature(item:string){
//   this.selectedFeature = item;
// }



clearGateName(){
  this.gateForm.reset();
}

onClickEditOfGateName(){
  this.isEditGateEnabled = true;
}

onEditGateName(){
  var approvalGateToEdit = {
    "id": this.gateId,
    "name": this.gateForm.value.gateName,
    "serviceId": 1 //this.serviceId
  }
  this.store.dispatch(ApplicationActions.editApprovalGate({gateId : this.gateId,gateDataToEdit : approvalGateToEdit }));
}

onDeleteGateName(){
  this.store.dispatch(ApplicationActions.deleteApprovalGate({gateId : this.gateId}));
}

onChangeTooltype(tooltype){
  console.log(tooltype);
  this.store.dispatch(ApplicationActions.getAccountToolType({connectorType : tooltype}));
  this.store.dispatch(ApplicationActions.getTemplatesToolType({connectorType : tooltype}));
}

onChangeAccountofTooltype(account){
  console.log(account);
  this.connectorId = account;

}

onChangeTemplateofTooltype(template,index){
  if(template == '+') {
    this.templateId[index] = '';
    let visibilityConfigFormArray = this.visibilityForm.get('visibilityConfig') as FormArray
    visibilityConfigFormArray.controls[index].get('templateName').setValue('');
    let toolType = visibilityConfigFormArray.controls[index].get('connectorType').value;

    if(!toolType) {
      // Show validation on Tool type field and alert user to select Tool type first.
    }

    this.toolTemplateForm = new FormGroup({
      toolType: new FormControl(toolType),
      name: new FormControl('',[Validators.required]),
      template: new FormControl('')
    });
    setTimeout(() => {
      this.newtemplate.nativeElement.click();
    }, 100);
    
    return;
  }
  console.log(template);
  this.templateId[index] = template;
}

saveToolTypeTemplateForm() {
  if(this.toolTemplateForm.valid) {
    this.tooltypeTemplateData = this.toolTemplateForm.value;
    this.saveTooltypeTemplate();
  }
}

saveTooltypeTemplate(){
  console.log(this.tooltypeTemplateData);
  this.store.dispatch(ApplicationActions.saveTemplateForTooltype({templateForToolTypeData : this.tooltypeTemplateData}));
  if(this.tooltypeTemplateModel !== undefined){
    this.tooltypeTemplateModel.nativeElement.click();
  }
}

//Below function is use to fetched json from json editor
getJsonFromTooltypeTemplateEditor(event = null){
  this.tooltypeTemplateData = this.tooltypeTemplateEditorJson.get();
}


onClickTemplateTab(event){
  if(event === 'tooltype-template-form-tab'){
    this.selectedTTTemplateTab = 'tooltype-template-form';
  } else if(event === 'tooltype-template-editor-tab') {
    this.selectedTTTemplateTab = 'tooltype-template-editor';
  }
}

autoFocus(focusedClass){
  this.showserviceGroup=true;
  
}
configuredFeaturepresent(totalServices){
  
  for(let i=0;i<totalServices;i++)
  {
    var myjson = {
      servicename:this.appData.services[i].serviceName,
      serviceFeatures:[]
    }
    this.isFeaturePresent.push(myjson)
    for(let j=0;j<this.featureList.length;j++)
    {
      var value
      debugger
      for(let k =0;k<this.featureList.length; k++)
      if(this.configuredFeature[i].configuredFeatures[k] == this.featureList[j].toLowerCase())
      {
        value=true;
        break;
      }
      else{
        value=false;
      }
      
     this.isFeaturePresent[i].serviceFeatures.push(value)
    }
  }
  
}

}
