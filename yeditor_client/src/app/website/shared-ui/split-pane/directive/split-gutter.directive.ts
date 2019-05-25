import { Directive, ElementRef, Renderer2, Input, RendererStyleFlags2 } from '@angular/core';

export type GutterDirection = 'vertical' | 'horizontal';
export type GutterState = 'disabled' | GutterDirection;

@Directive({
  selector: '[appSplitGutter]',
})
export class SplitGutterDirective {
  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  @Input() set order(value: number) {
    this.setStyle('order', value);
  }

  @Input() set useTransition(value: boolean) {
    if (value) {
      this.setStyle('transition', 'flex-basis 0.3s');
    } else {
      this.removeStyle('transition');
    }
  }

  private _direction: GutterDirection;
  get direction(): GutterDirection {
    return this._direction;
  }
  @Input() set direction(value: GutterDirection) {
    this._direction = value; this.refreshStyle();
  }

  private _size: number;
  get size(): number {
    return this._size;
  }
  @Input() set size(value: number) {
    this._size = value;
    this.refreshStyle();
  }

  private _color: string;
  get color(): string {
    return this._color;
  }
  @Input() set color(value: string) {
    this._color = value;
    this.refreshStyle();
  }

  private _imageH: string;
  get imageH(): string {
    return this._imageH;
  }
  @Input() set imageH(value: string) {
    this._imageH = value;
    this.refreshStyle();
  }

  private _imageV: string;
  get imageV(): string {
    return this._imageV;
  }
  @Input() set imageV(value: string) {
    this._imageV = value;
    this.refreshStyle();
  }

  private _disabled = false;
  get disabled(): boolean {
    return this._disabled;
  }
  @Input() set disabled(value: boolean) {
    this._disabled = value;
    this.refreshStyle();
  }

  // privates

  private get nativeElement() {
    return this.elementRef.nativeElement;
  }

  private setStyle(style: string, value: any, flags?: RendererStyleFlags2): void {
    this.renderer.setStyle(this.nativeElement, style, value, flags);
  }

  private removeStyle(style: string, flags?: RendererStyleFlags2): void {
    this.renderer.removeStyle(this.nativeElement, style, flags);
  }

  private refreshStyle(): void {
    this.setStyle('flex-basis', `${this.size}px`);
    // fix safari bug about gutter height when direction is horizontal
    this.setStyle('height', (this.direction === 'vertical') ? `${this.size}px` : '100%');
    //
    this.setStyle('background-color', (this.color !== '') ? this.color : '#7f7f7f');

    const state: GutterState = (this.disabled === true ? 'disabled' : this.direction);
    this.setStyle('background-image', this.getImage(state));
    this.setStyle('cursor', this.getCursor(state));
  }

  private getCursor(state: GutterState): string {
    switch (state) {
      case 'horizontal': return 'col-resize';
      case 'vertical': return 'row-resize';
      case 'disabled': return 'default';
    }
  }

  private getImage(state: GutterState): string {
    switch (state) {
      case 'horizontal': return (this.imageH !== '' ? this.imageH : defaultImageH);
      case 'vertical': return (this.imageV !== '' ? this.imageV : defaultImageV);
      case 'disabled': return '';
    }
  }
}

// tslint:disable:max-line-length
const defaultImageH = ''; // 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAeCAYAAADkftS9AAAAIklEQVQoU2M4c+bMfxAGAgYYmwGrIIiDjrELjpo5aiZeMwF+yNnOs5KSvgAAAABJRU5ErkJggg==")';
const defaultImageV = ''; // 'url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAB4AAAAFCAMAAABl/6zIAAAABlBMVEUAAADMzMzIT8AyAAAAAXRSTlMAQObYZgAAABRJREFUeAFjYGRkwIMJSeMHlBkOABP7AEGzSuPKAAAAAElFTkSuQmCC")';
