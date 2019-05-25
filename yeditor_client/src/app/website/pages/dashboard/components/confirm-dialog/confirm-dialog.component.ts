import { Component, Inject, ChangeDetectionStrategy } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';

@Component({
  selector: 'app-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
  }

  get title(): string {
    return this.data.title || 'Confirmation';
  }

  get content(): string {
    return this.data.content || 'Are you sure?';
  }

  get payload(): string {
    return this.data.payload || true;
  }

  get cancelButton(): string {
    return this.data.cancelButton || 'Cancel';
  }

  get okButton(): string {
    return this.data.okButton || 'OK';
  }

  get okColor(): string {
    return this.data.okColor || 'primary';
  }

  onCancelClick(): void {
    this.dialogRef.close();
  }
}
