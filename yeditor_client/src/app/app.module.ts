import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { AppComponent } from './app.component';
import { WebsiteModule } from './website/website.module';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    NoopAnimationsModule,
    BrowserModule.withServerTransition({ appId: 'codepad-website' }),
    WebsiteModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
