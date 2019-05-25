import { GutterDirection } from './../directive/split-gutter.directive';
import { SplitAreaDirective } from '../directive/split-area.directive';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/buffer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

import {
  Component, OnInit, AfterViewInit, OnDestroy, Input,
  ChangeDetectorRef, ElementRef,
  Renderer2, Output, EventEmitter, HostBinding
} from '@angular/core';
import { Subject } from 'rxjs/Subject';


//
// copy from https://github.com/bertrandg/angular-split
//
// angular-split
//
// Areas size are set in percentage of the split container.
// Gutters size are set in pixels.
//
// So we set css 'flex-basis' property like this (where 0 <= area.size <= 1):
//  calc( { area.size * 100 }% - { area.size * nbGutter * gutterSize }px );
//
// Examples with 3 visible areas and 2 gutters:
//
// |                     10px                   10px                                  |
// |---------------------[]---------------------[]------------------------------------|
// |  calc(20% - 4px)          calc(20% - 4px)              calc(60% - 12px)          |
//
//
// |                          10px                        10px                        |
// |--------------------------[]--------------------------[]--------------------------|
// |  calc(33.33% - 6.667px)      calc(33.33% - 6.667px)      calc(33.33% - 6.667px)  |
//
//
// |10px                                                  10px                        |
// |[]----------------------------------------------------[]--------------------------|
// |0                 calc(66.66% - 13.333px)                  calc(33%% - 6.667px)   |
//
//
//  10px 10px                                                                         |
// |[][]------------------------------------------------------------------------------|
// |0 0                               calc(100% - 20px)                               |
//


export interface Point {
  x: number;
  y: number;
}

export interface Area {
  size: number;
  order: number;
  component: SplitAreaDirective;
}

export type WritingMode = 'ltr' | 'rtl';

export interface DragEventData {
  gutterNumber: number;
  sizes: number[];
}

@Component({
  selector: 'app-split-pane',
  templateUrl: './split-pane.component.html',
  styleUrls: ['./split-pane.component.scss']
})
export class SplitPaneComponent implements AfterViewInit, OnDestroy {
  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private elementRef: ElementRef,
    private renderer: Renderer2,
  ) { }

  private get nativeElement(): any {
    return this.elementRef.nativeElement;
  }

  isViewInitialized = false;
  private isDragging = false;
  private draggingWithoutMove = false;
  private currentGutterNumber = 0;

  readonly displayedAreas: Area[] = [];
  private readonly hidedAreas: Area[] = [];

  private dragListeners: Function[] = [];
  private readonly dragStartValues = {
    sizePixelContainer: 0,
    sizePixelA: 0,
    sizePixelB: 0,
    sizePercentA: 0,
    sizePercentB: 0,
  };

  private _direction: GutterDirection = 'horizontal';
  get direction(): GutterDirection {
    return this._direction;
  }
  @Input() set direction(value: GutterDirection) {
    value = (value === 'vertical') ? 'vertical' : 'horizontal';
    this._direction = value;
    [...this.displayedAreas, ...this.hidedAreas].forEach(area => {
      area.component.setStyleVisibleAndDirection(area.component.visible, this.isDragging, this.direction);
    });
  }

  private _useTransition = false;
  get useTransition(): boolean {
    return this._useTransition;
  }
  @Input() set useTransition(value: boolean) {
    value = (typeof (value) === 'boolean') ? value : (value === 'false' ? false : true);
    this._useTransition = value;
  }

  private _disabled = false;
  get disabled(): boolean {
    return this._disabled;
  }
  @Input() set disabled(value: boolean) {
    value = (typeof (value) === 'boolean') ? value : (value === 'false' ? false : true);
    this._disabled = value;
    // Force repaint if modified from TS class (instead of the template)
    this.changeDetectorRef.markForCheck();
  }

  private _width: number | null = null;
  get width(): number | null {
    return this._width;
  }
  @Input() set width(value: number | null) {
    value = Number(value);
    this._width = (!isNaN(value) && value > 0) ? value : null;
    this.build(false, false);
  }

  private _height: number | null = null;
  get height(): number | null {
    return this._height;
  }
  @Input() set height(value: number | null) {
    value = Number(value);
    this._height = (!isNaN(value) && value > 0) ? value : null;
    this.build(false, false);
  }

  private _gutterSize: number | null = 11;
  get gutterSize(): number {
    return this._gutterSize;
  }
  @Input() set gutterSize(value: number | null) {
    value = Number(value);
    this._gutterSize = (!isNaN(value) && value > 0) ? value : null;
    this.build(false, false);
  }

  private _gutterColor = '';
  get gutterColor(): string {
    return this._gutterColor;
  }
  @Input() set gutterColor(value: string) {
    this._gutterColor = (typeof value === 'string' && value !== '') ? value : '';
    this.changeDetectorRef.markForCheck();
  }

  private _gutterImageH = '';
  get gutterImageH(): string {
    return this._gutterImageH;
  }
  @Input() set gutterImageH(value: string) {
    this._gutterImageH = (typeof value === 'string' && value !== '') ? value : '';
    this.changeDetectorRef.markForCheck();
  }

  private _gutterImageV = '';
  get gutterImageV(): string {
    return this._gutterImageV;
  }
  @Input() set gutterImageV(value: string) {
    this._gutterImageV = (typeof value === 'string' && value !== '') ? value : '';
    this.changeDetectorRef.markForCheck();
  }

  private _dir: WritingMode = 'ltr';
  get dir(): WritingMode {
    return this._dir;
  }
  @Input() set dir(value: WritingMode) {
    value = (value === 'rtl') ? 'rtl' : 'ltr';
    this._dir = value;
  }

  @Output() dragStart = new EventEmitter<DragEventData>(false);
  @Output() dragProcess = new EventEmitter<DragEventData>(false);
  @Output() dragEnd = new EventEmitter<DragEventData>(false);
  @Output() gutterClick = new EventEmitter<DragEventData>(false);
  @Output() gutterDoubleClick = this.gutterClick.buffer(this.gutterClick.debounceTime(200)).filter(it => it.length === 2);

  private transitionEndInterval = new Subject<number[]>();
  @Output() transitionEnd = this.transitionEndInterval.asObservable().debounceTime(20);

  @HostBinding('style.flex-direction') get cssFlexDirection(): string {
    return this.direction === 'horizontal' ? 'row' : 'column';
  }

  @HostBinding('style.width') get cssWidth(): string {
    return this.width ? `${this.width}px` : '100%';
  }

  @HostBinding('style.height') get cssHeight(): string {
    return this.height ? `${this.height}px` : '100%';
  }

  @HostBinding('style.min-width') get cssMinWidth(): string {
    return this.direction === 'horizontal' ? `${this.getGuttersCount() * this.gutterSize}px` : null;
  }

  @HostBinding('style.min-height') get cssMinHeight(): string {
    return this.direction === 'vertical' ? `${this.getGuttersCount() * this.gutterSize}px` : null;
  }

  private getGuttersCount(): number {
    return this.displayedAreas.length - 1;
  }

  ngAfterViewInit() {
    this.isViewInitialized = true;
  }

  ngOnDestroy() {
    this.stopDragging();
  }

  addArea(component: SplitAreaDirective): void {
    const newArea: Area = {
      component: component,
      order: 0,
      size: 0,
    };
    if (component.visible === true) {
      this.displayedAreas.push(newArea);
    } else {
      this.hidedAreas.push(newArea);
    }
    component.setStyleVisibleAndDirection(component.visible, this.isDragging, this.direction);
    this.build(true, true);
  }

  removeArea(component: SplitAreaDirective): void {
    const displayedAreaIndex = this.displayedAreas.findIndex(it => it.component === component);
    if (displayedAreaIndex >= 0) {
      this.displayedAreas.splice(displayedAreaIndex, 1);
      this.build(true, true);
      return;
    }
    const hidedAreaIndex = this.hidedAreas.findIndex(it => it.component === component);
    if (hidedAreaIndex >= 0) {
      this.hidedAreas.splice(hidedAreaIndex, 1);
    }
  }

  updateArea(component: SplitAreaDirective, resetOrders: boolean, resetSizes: boolean): void {
    const area = this.displayedAreas.find(it => it.component === component);
    if (area) {
      this.build(resetOrders, resetSizes);
    }
  }

  resetAreaSizes(): void {
    this.build(false, true);
  }

  showArea(component: SplitAreaDirective) {
    const areaIndex = this.hidedAreas.findIndex(it => it.component === component);
    if (areaIndex >= 0) {
      component.setStyleVisibleAndDirection(component.visible, this.isDragging, this.direction);

      const areas = this.hidedAreas.splice(areaIndex, 1);
      this.displayedAreas.push(...areas);

      this.build(true, true);
    }
  }

  hideArea(component: SplitAreaDirective) {
    const areaIndex = this.displayedAreas.findIndex(it => it.component === component);
    if (areaIndex >= 0) {
      component.setStyleVisibleAndDirection(component.visible, this.isDragging, this.direction);

      const areas = this.displayedAreas.splice(areaIndex, 1);
      areas.forEach(it => it.order = it.size = 0);
      this.hidedAreas.push(...areas);

      this.build(true, true);
    }
  }

  private build(resetOrders: boolean, resetSizes: boolean): void {
    this.stopDragging();

    // AREAS ORDER
    if (resetOrders === true) {
      if (this.displayedAreas.every(it => it.component.order !== null)) {
        this.displayedAreas.sort((a, b) => a.component.order - b.component.order);
      }
      this.displayedAreas.forEach((area, index) => {
        area.order = index * 2;
        area.component.setStyleOrder(area.order);
      });
    }

    // AREAS SIZES
    if (resetSizes === true) {
      const totalUserSize = this.displayedAreas.reduce(
        (total: number, area: Area) => {
          if (area.component.size !== null) {
            return total + area.component.size;
          } else {
            return total;
          }
        }, 0
      );

      const everySizeNoneNull = this.displayedAreas.every(it => it.component.size !== null);
      if (everySizeNoneNull && totalUserSize > 0.999 && totalUserSize < 1.001) {
        this.displayedAreas.forEach(area => area.size = area.component.size);
      } else {
        const size = 1 / this.displayedAreas.length;
        this.displayedAreas.forEach(area => area.size = size);
      }
    }

    // If some real area sizes are less than gutterSize, set them to zero and dispatch size to others
    let percentToDispatch = 0;
    let containerSizePixel = this.getGuttersCount() * this.gutterSize;
    if (this.direction === 'horizontal') {
      containerSizePixel = this.width ? this.width : this.nativeElement['offsetWidth'];
    } else {
      containerSizePixel = this.height ? this.height : this.nativeElement['offsetHeight'];
    }

    this.displayedAreas.forEach(area => {
      if (area.size * containerSizePixel < this.gutterSize) {
        percentToDispatch += area.size;
        area.size = 0;
      }
    });

    if (percentToDispatch > 0 && this.displayedAreas.length > 0) {
      const areasNotZeroCount = this.displayedAreas.filter(it => it.size !== 0).length;
      if (areasNotZeroCount > 0) {
        const percentToAdd = percentToDispatch / areasNotZeroCount;
        this.displayedAreas.filter(it => it.size !== 0).forEach(it => it.size += percentToAdd);
      } else {
        this.displayedAreas[this.displayedAreas.length - 1].size = 1;
      }
    }

    this.refreshStyleSizes();
    this.changeDetectorRef.markForCheck();
  }

  private refreshStyleSizes(): void {
    const sumGutterSize = this.getGuttersCount() * this.gutterSize;
    this.displayedAreas.forEach(it => {
      const styleValue = `calc( ${it.size * 100}% - ${it.size * sumGutterSize}px )`;
      it.component.setStyleFlexbasis(styleValue, this.isDragging);
    });
  }

  startDragging(startEvent: MouseEvent | TouchEvent, gutterOrder: number, gutterNumber: number): void {
    startEvent.preventDefault();

    // allow '(gutterClick)' event if '[disabled]="true"'
    this.currentGutterNumber = gutterNumber;
    this.draggingWithoutMove = true;
    this.dragListeners.push(this.renderer.listen('document', 'mouseup', e => this.stopDragging()));
    this.dragListeners.push(this.renderer.listen('document', 'touchend', e => this.stopDragging()));
    this.dragListeners.push(this.renderer.listen('document', 'touchcancel', e => this.stopDragging()));

    if (this.disabled) {
      return;
    }

    const areaA = this.displayedAreas.find(it => it.order === gutterOrder - 1);
    const areaB = this.displayedAreas.find(it => it.order === gutterOrder + 1);

    if (!areaA || !areaB) {
      return;
    }

    const property = (this.direction === 'horizontal') ? 'offsetWidth' : 'offsetHeight';

    this.dragStartValues.sizePixelContainer = this.nativeElement[property];
    this.dragStartValues.sizePixelA = areaA.component.getSizePixel(property);
    this.dragStartValues.sizePixelB = areaB.component.getSizePixel(property);
    this.dragStartValues.sizePercentA = areaA.size;
    this.dragStartValues.sizePercentB = areaB.size;

    let start: Point;
    if (startEvent instanceof MouseEvent) {
      start = { x: startEvent.screenX, y: startEvent.screenY };
    } else if (startEvent instanceof TouchEvent) {
      start = { x: startEvent.touches[0].screenX, y: startEvent.touches[0].screenY };
    } else {
      return;
    }

    this.dragListeners.push(this.renderer.listen('document', 'mousemove', e => this.dragEvent(e, start, areaA, areaB)));
    this.dragListeners.push(this.renderer.listen('document', 'touchmove', e => this.dragEvent(e, start, areaA, areaB)));

    areaA.component.lockEvents();
    areaB.component.lockEvents();

    this.isDragging = true;

    this.notify('start');
  }

  private dragEvent(event: MouseEvent | TouchEvent, start: Point, areaA: Area, areaB: Area): void {
    if (!this.isDragging) {
      return;
    }
    let end: Point;
    if (event instanceof MouseEvent) {
      end = { x: event.screenX, y: event.screenY };
    } else if (event instanceof TouchEvent) {
      end = { x: event.touches[0].screenX, y: event.touches[0].screenY };
    } else {
      return;
    }
    this.draggingWithoutMove = false;
    this.drag(start, end, areaA, areaB);
  }

  private drag(start: Point, end: Point, areaA: Area, areaB: Area): void {
    // AREAS SIZE PIXEL
    let offsetPixel = (this.direction === 'horizontal') ? (start.x - end.x) : (start.y - end.y);
    if (this.dir === 'rtl') {
      offsetPixel = -offsetPixel;
    }

    let newSizePixelA = this.dragStartValues.sizePixelA - offsetPixel;
    let newSizePixelB = this.dragStartValues.sizePixelB + offsetPixel;

    if (newSizePixelA < this.gutterSize && newSizePixelB < this.gutterSize) {
      return;
    } else if (newSizePixelA < this.gutterSize) {
      newSizePixelB += newSizePixelA;
      newSizePixelA = 0;
    } else if (newSizePixelB < this.gutterSize) {
      newSizePixelA += newSizePixelB;
      newSizePixelB = 0;
    }

    // AREAS SIZE PERCENT
    if (newSizePixelA === 0) {
      areaB.size += areaA.size;
      areaA.size = 0;
    } else if (newSizePixelB === 0) {
      areaA.size += areaB.size;
      areaB.size = 0;
    } else {
      // NEW_PERCENT = START_PERCENT / START_PIXEL * NEW_PIXEL
      if (this.dragStartValues.sizePercentA === 0) {
        areaB.size = this.dragStartValues.sizePercentB / this.dragStartValues.sizePixelB * newSizePixelB;
        areaA.size = this.dragStartValues.sizePercentB - areaB.size;
      } else if (this.dragStartValues.sizePercentB === 0) {
        areaA.size = this.dragStartValues.sizePercentA / this.dragStartValues.sizePixelA * newSizePixelA;
        areaB.size = this.dragStartValues.sizePercentA - areaA.size;
      } else {
        areaA.size = this.dragStartValues.sizePercentA / this.dragStartValues.sizePixelA * newSizePixelA;
        areaB.size = (this.dragStartValues.sizePercentA + this.dragStartValues.sizePercentB) - areaA.size;
      }
    }

    this.refreshStyleSizes();
    this.notify('progress');
  }

  private stopDragging(): void {
    if (this.isDragging === false && this.draggingWithoutMove === false) {
      return;
    }
    this.displayedAreas.forEach(it => it.component.unlockEvents());

    this.dragListeners.forEach(it => it && it());
    this.dragListeners = [];

    if (this.draggingWithoutMove === true) {
      this.notify('click');
    } else {
      this.notify('end');
    }

    this.isDragging = false;
    this.draggingWithoutMove = false;
  }

  public notify(type: 'start' | 'progress' | 'end' | 'click' | 'transitionEnd'): void {
    const areaSizes = this.displayedAreas.map(it => it.size * 100);

    switch (type) {
      case 'start': return this.dragStart.emit({ gutterNumber: this.currentGutterNumber, sizes: areaSizes });
      case 'progress': return this.dragProcess.emit({ gutterNumber: this.currentGutterNumber, sizes: areaSizes });
      case 'end': return this.dragEnd.emit({ gutterNumber: this.currentGutterNumber, sizes: areaSizes });
      case 'click': return this.gutterClick.emit({ gutterNumber: this.currentGutterNumber, sizes: areaSizes });
      case 'transitionEnd': return this.transitionEndInterval.next(areaSizes);
    }
  }
}
