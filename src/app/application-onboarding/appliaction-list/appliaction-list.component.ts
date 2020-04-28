import { Component, OnInit} from '@angular/core';
import { Store } from '@ngrx/store';
import * as fromApp from '../../store/app.reducer';
import * as OnboardingActions from '../store/onBoarding.actions';
import { ApplicationList } from 'src/app/models/applicationOnboarding/applicationList/applicationList.model';
import * as $ from 'jquery';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-appliaction-list',
  templateUrl: './appliaction-list.component.html',
  styleUrls: ['./appliaction-list.component.less']
})

export class AppliactionListComponent implements OnInit {
  tableIsEmpty: boolean = false;                                                       // It use to hide table if no record exist in it.
  appListData: ApplicationList []= null;                                               // It use to store Applist data fetched from state.
  searchData: string = '';                                                             // this is use to fetch value from search field.
  perPageData: number = 10;                                                            // this is use to populate value in perPage dropdown exist in pagination.
  page = {                                                                             // this is use to support pagination in audit page.
    startingPoint: 0,
    endPoint: 10,
    pageSize: 10,
    currentPage: 1,
    pageNo: 1,
  }
  currentPage = [];                                                                    // this use to store array of data exists in current page.
  appListLength: number = null;                                                        // It use to store AppList array length

  constructor(public store: Store<fromApp.AppState>,
              public toastr: NotificationService) { }
  
  ngOnInit(): void {

    //fetching data from state
    this.store.select('appOnboarding').subscribe(
      (response) => {
        if (response.applicationList !== null) {
          this.appListData = response.applicationList;
          this.appListLength = this.appListData.length;
          this.renderPage();
          this.tableIsEmpty = false;
        }else{
          this.tableIsEmpty = true;
        }
      }
    )
  }

  //Below function is execute on search
  onSearch(){
    if(this.searchData !== ''){
      this.currentPage = [];
      for (let i = 0; i < this.appListLength; i++) {
        this.currentPage.push(this.appListData[i]);
      }
    }else{
      this.renderPage();
    }
  }

  // Below function is use to redirect to create application page
  createApplication() {
    this.store.dispatch(OnboardingActions.loadApp({page:'/setup'}));
  }

  //Below function is used to implement pagination
  renderPage() {
    this.currentPage = [];
    if(this.page.endPoint < this.appListLength-1){
      for (let i = this.page.startingPoint; i < this.page.endPoint; i++) {
        this.currentPage.push(this.appListData[i]);
      }
    }else{
      for (let i = this.page.startingPoint; i < this.appListLength; i++) {
        this.currentPage.push(this.appListData[i]);
      }
    }
  }

  //Below function is execute on change of perPage dropdown value
  onChangePerPageData() {
    this.page.pageSize = +this.perPageData;
    if ((this.page.startingPoint + this.page.pageSize) < this.appListLength) {
      this.page.endPoint = this.page.startingPoint + this.page.pageSize;
    } else {
      this.page.endPoint = this.appListLength;
    }
    this.renderPage();
  }

  //Below function is execute on click of page next btn
  pageNext() {
    if (this.page.endPoint < this.appListLength-1) {
      this.page.pageNo += 1;
      this.page.currentPage = this.page.pageNo;
      if ((this.page.endPoint + this.page.pageSize) < this.appListLength) {
        this.page.startingPoint += this.page.pageSize;
        this.page.endPoint += this.page.pageSize;
      } else if (this.page.endPoint < this.appListLength) {
        this.page.startingPoint = this.page.endPoint;
        this.page.endPoint = this.appListLength-1;
      }
      this.renderPage();
    }
  }

  //Below function is execute on click of page prev btn
  pagePrev() {
    if (this.page.startingPoint !== 0) {
      this.page.pageNo -= 1;
      this.page.currentPage = this.page.pageNo;
      if ((this.page.startingPoint - this.page.pageSize) > 0) {
        this.page.startingPoint -= this.page.pageSize;
        this.page.endPoint = this.page.startingPoint + this.page.pageSize;
      } else if ((this.page.startingPoint - this.page.pageSize) >= 0) {
        this.page.startingPoint = 0;
        this.page.endPoint = this.page.pageSize;
      }
      this.renderPage();
    }
  }

  //Below function is executes on click of page btn exist in pagination
  showPage(currentPage) {
    this.page.pageNo = currentPage;
    this.page.startingPoint = (currentPage - 1) * this.page.pageSize;
    if (currentPage * this.page.pageSize < this.appListLength) {
      this.page.endPoint = currentPage * this.page.pageSize;
    } else {
      this.page.endPoint = this.appListLength-1;
    }
    this.renderPage();
  }

  //Below function is use to delete application fron existing list
  appDelete(index){
    $("[data-toggle='tooltip']").tooltip('hide');
    this.toastr.showSuccess('Application is deleted successfully!!','SUCCESS')
    this.store.dispatch(OnboardingActions.appDelete({index}));
  }

  // Below function is use for edit application
  editApplication(index){
    $("[data-toggle='tooltip']").tooltip('hide');
    this.store.dispatch(OnboardingActions.enableEditMode({ editMode: true, applicationName: this.appListData[index].name,page:'/setup'}));
  }

}