import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ConfigService } from 'app/website/shared/services/common/config.service';


@Component({
  selector: 'app-codepad-invite-dialog',
  templateUrl: './codepad-invite-dialog.component.html',
  styleUrls: ['./codepad-invite-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadInviteDialogComponent {

  constructor(
    public config: ConfigService,
    public dialogRef: MatDialogRef<CodepadInviteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) { }

  get shortLinkId(): string { return this.data.shortLinkId; }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
