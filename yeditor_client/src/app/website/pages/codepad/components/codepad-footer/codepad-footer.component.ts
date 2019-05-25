import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material';
import { CodepadInviteDialogComponent } from '../codepad-invite-dialog/codepad-invite-dialog.component';

@Component({
  selector: 'app-codepad-footer',
  templateUrl: './codepad-footer.component.html',
  styleUrls: ['./codepad-footer.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CodepadFooterComponent implements OnInit {
  constructor(
    public dialog: MatDialog,
  ) { }

  ngOnInit() { }

  showInviteDialog() {
    const dialogData = { shortLinkId: 38292 };
    const dialogRef = this.dialog.open(CodepadInviteDialogComponent, {
      data: dialogData,
      position: { left: '15px', bottom: '65px' },
    });
    dialogRef.afterClosed().subscribe(it => {
    });
  }
}
