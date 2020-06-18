import { NgModule } from '@angular/core';
import { SatDatepickerModule, SatNativeDateModule } from 'saturn-datepicker';
import {MatButtonModule} from '@angular/material/button';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatInputModule} from '@angular/material/input';
import {MatNativeDateModule} from '@angular/material/core';
import {MatTableModule} from '@angular/material/table';
import {MatTabsModule} from '@angular/material/tabs';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatCardModule} from '@angular/material/card';
import {MatIconModule} from '@angular/material/icon';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatSidenavModule} from '@angular/material/sidenav';

@NgModule({
    exports: [
      MatDatepickerModule,
      MatNativeDateModule,
      MatInputModule,
      MatButtonModule, 
      SatDatepickerModule, 
      SatNativeDateModule,
      MatCardModule,
      MatTabsModule,
      MatIconModule,
      MatToolbarModule,
      MatTableModule,
      MatAutocompleteModule,
      MatSidenavModule,
    ]
  })
export class AppMaterialModule { }
