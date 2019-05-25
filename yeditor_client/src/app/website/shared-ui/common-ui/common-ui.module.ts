
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material';
import { SigninGithubComponent } from './components/signin-github/signin-github.component';

@NgModule({
  declarations: [
    SigninGithubComponent,
  ],
  exports: [
    SigninGithubComponent,
  ],
  imports: [
    MatButtonModule,
  ],
})
export class CommonUiModule {

}
