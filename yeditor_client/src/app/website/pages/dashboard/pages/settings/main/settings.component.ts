import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Language, Languages } from 'app/website/shared/models/languages.model';
import { LoggerService } from 'app/website/shared/services/common/logger.service';
import { //
  CommonActionApiErrorStateReset, CommonActionConfirmDialog, selectCommonStateApiErrorState
} from 'app/website/store/common';
import { ApiErrorState, ConfirmDataParams } from 'app/website/store/common/store/common.model';
import { //
  selectDashboardSettingsStateSetting, Setting, SettingParams, //
  SettingsActionQuery, SettingsActionRefreshApiKey, SettingsActionSave
} from 'app/website/store/dashboard/stores/settings';
import { WebsiteState } from 'app/website/store/website-store.reducer';
import { Subscription } from 'rxjs/Subscription';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SettingsComponent implements OnInit, OnDestroy {

  constructor(
    private logger: LoggerService,
    private store$: Store<WebsiteState>,
    private changeDetector: ChangeDetectorRef,
  ) { }

  private subscriptions: Subscription[] = [];
  private setting$ = this.store$.select(selectDashboardSettingsStateSetting);
  private errorState$ = this.store$.select(selectCommonStateApiErrorState);

  settingParams: SettingParams = {
    api_key: '',
    email: '',
    name: '',
    language: Languages.typescript,
  };

  fieldErrors: { name?: string, email?: string } = {};

  ngOnInit() {
    this.store$.dispatch(new SettingsActionQuery());
    this.subscriptions.push(this.setting$.subscribe(it => this.onSettingsStateChanged(it)));
    this.subscriptions.push(this.errorState$.subscribe(it => this.onErrorStateChanged(it)));
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(it => it.unsubscribe());
    this.subscriptions = [];
  }

  private onSettingsStateChanged(setting: Setting) {
    // this.logger.log('it = ', setting);
    if (setting == null) {
      return;
    }
    this.settingParams = {
      id: setting.id || 0,
      api_key: setting.api_key || '',
      email: setting.email || '',
      name: setting.name || '',
      language: setting.language || Languages.typescript,
      pads_private: setting.pads_private,
      email_subscription: setting.email_subscription,
      code_execution: setting.code_execution,
    };
    // this.logger.log('params = ', this.settingParams);
    this.changeDetector.markForCheck();
  }

  private onErrorStateChanged(errorState: ApiErrorState) {
    this.fieldErrors = {};
    if (errorState != null) {
      ['name', 'email'].forEach(key => {
        this.fieldErrors[key] = errorState.errors[key];
      });
    }
    this.changeDetector.markForCheck();
  }

  onLanguageChanged(language: Language) {
    this.settingParams.language = language;
  }

  onSave() {
    this.store$.dispatch(new CommonActionApiErrorStateReset());
    this.store$.dispatch(new SettingsActionSave({ setting: this.settingParams }));
  }

  onRefreshApiKey() {
    const confirmParams: ConfirmDataParams = {
      content: 'Are you sure to RESET api key?',
      afterClose: (result) => {
        if (result) {
          this.store$.dispatch(new SettingsActionRefreshApiKey());
        }
      }
    };
    this.store$.dispatch(new CommonActionConfirmDialog(confirmParams));
  }
}
