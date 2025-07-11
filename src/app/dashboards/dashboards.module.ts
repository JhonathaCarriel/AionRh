import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardsPageRoutingModule } from './dashboards-routing.module';
import { DashboardsPage } from './dashboards.page';
import { HeaderComponent } from '../header/header.component';



@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HeaderComponent,
    IonicModule,
    DashboardsPageRoutingModule
  ],
  declarations: [DashboardsPage]
})
export class DashboardsPageModule {}
