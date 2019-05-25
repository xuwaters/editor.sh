import { GutterDirection } from './split-gutter.directive';

import { Directive, Input, ElementRef, Renderer2, OnInit, OnDestroy, RendererStyleFlags2 } from '@angular/core';
import { SplitPaneComponent } from '../components/split-pane.component';

@Directive({
  selector: '[appSplitArea]',
})
export class SplitAreaDirective implements OnInit, OnDestroy {

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    private splitPane: SplitPaneComponent
  ) { }

  private dragSubscriptions: Function[] = [];
  private transitionSubscriptions: Function[] = [];

  private _order: number | null = null;
  get order(): number | null {
    return this._order;
  }
  @Input() set order(value: number | null) {
    value = Number(value);
    this._order = !isNaN(value) ? value : null;
    this.splitPane.updateArea(this, true, false);
  }

  private _size: number | null = null;
  get size(): number | null {
    return this._size;
  }
  @Input() set size(value: number | null) {
    value = Number(value);
    this._size = (!isNaN(value) && value >= 0 && value <= 100) ? (value / 100) : null;
    this.splitPane.updateArea(this, false, true);
  }

  private _minSize = 0;
  get minSize(): number {
    return this._minSize;
  }
  @Input() set minSize(value: number) {
    value = Number(value);
    this._minSize = (!isNaN(value) && value > 0 && value < 100) ? value / 100 : 0;
    this.splitPane.updateArea(this, false, true);
  }

  private _visible = true;
  get visible(): boolean {
    return this._visible;
  }
  @Input() set visible(value: boolean) {
    value = (typeof (value) === 'boolean') ? value : (value === 'false' ? false : true);
    this._visible = value;
    if (this._visible) {
      this.splitPane.showArea(this);
    } else {
      this.splitPane.hideArea(this);
    }
  }


  ngOnInit() {
    this.splitPane.addArea(this);

    this.setStyle('flex-grow', '0');
    this.setStyle('flex-shrink', '0');

    this.subscribeTransitionEvents();
  }

  ngOnDestroy() {
    this.unsubscribeDragEvents();
    this.unsubscribeTransitionEvents();
    this.splitPane.removeArea(this);
  }

  getSizePixel(prop: 'offsetWidth' | 'offsetHeight'): number {
    return this.nativeElement[prop];
  }

  setStyleVisibleAndDirection(isVisible: boolean, isDragging: boolean, direction: GutterDirection): void {
    if (isVisible === false) {
      this.setStyleFlexbasis('0', isDragging);
      this.setStyle('overflow-x', 'hidden');
      this.setStyle('overflow-y', 'hidden');

      if (direction === 'vertical') {
        this.setStyle('max-width', '0');
      }
    } else {
      this.setStyle('overflow-x', 'hidden');
      this.setStyle('overflow-y', 'auto');
      this.removeStyle('max-width');
    }

    if (direction === 'horizontal') {
      this.setStyle('height', '100%');
      this.removeStyle('width');
    } else {
      this.setStyle('width', '100%');
      this.removeStyle('height');
    }
  }

  setStyleOrder(value: number) {
    this.setStyle('order', value);
  }

  setStyleFlexbasis(value: string, isDragging: boolean): void {
    // If component not yet initialized or gutter being dragged, disable transition
    if (this.splitPane.isViewInitialized === false || isDragging === true) {
      this.setStyleTransition(false);
    } else {
      // Or use 'useTransition' to know if transition
      this.setStyleTransition(this.splitPane.useTransition);
    }

    this.setStyle('flex-basis', value);
  }

  private setStyleTransition(useTransition: boolean) {
    if (useTransition) {
      this.setStyle('transition', 'flex-basis 0.3s');
    } else {
      this.removeStyle('transition');
    }
  }

  lockEvents() {
    this.subscribeDragEvents();
  }

  unlockEvents() {
    this.unsubscribeDragEvents();
  }

  private subscribeDragEvents() {
    this.dragSubscriptions.push(
      this.renderer.listen(this.nativeElement, 'selectstart', e => false)
    );
    this.dragSubscriptions.push(
      this.renderer.listen(this.nativeElement, 'dragstart', e => false)
    );
  }

  private unsubscribeDragEvents() {
    this.dragSubscriptions.forEach(it => it && it());
    this.dragSubscriptions = [];
  }

  private subscribeTransitionEvents() {
    this.transitionSubscriptions.push(
      this.renderer.listen(this.nativeElement, 'transitionend', e => this.onTransitionEnd(e))
    );
  }

  private unsubscribeTransitionEvents() {
    this.transitionSubscriptions.forEach(it => it && it());
    this.transitionSubscriptions = [];
  }

  private get nativeElement(): any {
    return this.elementRef.nativeElement;
  }

  private setStyle(style: string, value: any, flags?: RendererStyleFlags2): void {
    this.renderer.setStyle(this.nativeElement, style, value, flags);
  }

  private removeStyle(style: string, flags?: RendererStyleFlags2): void {
    this.renderer.removeStyle(this.nativeElement, style, flags);
  }

  private onTransitionEnd(event: TransitionEvent): void {
    // Limit only flex-basis transition to trigger the event
    if (event.propertyName === 'flex-basis') {
      this.splitPane.notify('transitionEnd');
    }
  }
}
