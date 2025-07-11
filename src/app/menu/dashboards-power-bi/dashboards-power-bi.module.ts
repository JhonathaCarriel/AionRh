import { HeaderComponent } from './../../header/header.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardsPowerBiPageRoutingModule } from './dashboards-power-bi-routing.module';

import { DashboardsPowerBiPage } from './dashboards-power-bi.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HeaderComponent,
    DashboardsPowerBiPageRoutingModule
  ],
  declarations: [DashboardsPowerBiPage]
})
export class DashboardsPowerBiPageModule {}
