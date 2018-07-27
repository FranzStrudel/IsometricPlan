import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { FactoryPlanModule } from './factory-plan/factory-plan.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FactoryPlanModule
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
