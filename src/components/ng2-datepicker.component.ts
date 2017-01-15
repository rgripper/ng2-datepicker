import { Component, ElementRef, Inject, OnInit, forwardRef, Input, Output, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';

const Moment: any = (<any>moment).default || moment;

export interface IDateModel {
  day: string;
  month: string;
  year: string;
  formatted: string;
  momentObj: moment.Moment;
}

export interface IDatePickerOptions {
  autoApply?: boolean;
  style?: 'normal' | 'big' | 'bold';
  locale?: string;
  minDate?: Date;
  maxDate?: Date;
  initialDate?: Date;
  firstWeekdaySunday?: boolean;
  format?: string;
}

const defaultDatePickerOptions:IDatePickerOptions = { autoApply: true, style: 'normal', locale: 'en', format : 'YYYY-MM-DD', firstWeekdaySunday: true };

export interface CalendarDate {
  day: number;
  month: number;
  year: number;
  enabled: boolean;
  today: boolean;
  selected: boolean;
  momentObj: moment.Moment;
}

export const CALENDAR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DatePickerComponent),
  multi: true
};




@Component({
  selector: 'ng2-datepicker',
  template: ``,
  styles: ['./ng2-datepicker.component.css'],
  providers: [CALENDAR_VALUE_ACCESSOR]
})
export class DatePickerComponent implements ControlValueAccessor, OnInit {
  @Input() options: IDatePickerOptions;
  @Output() change = new EventEmitter<Date>();

  opened = false;


  private onTouchedCallback: () => void = () => { };
  private onChangeCallback: (_: any) => void = () => { };

  private view: string;
  private formater: { fromView: (x: string) => Date; toView: (x: Date) => string };

  get value(): Date {
    return this.formater.fromView(this.view);
  }

  set value(value: Date) {
    this.view = this.formater.toView(value);
  }

  ngOnInit() {
    this.options = { ...defaultDatePickerOptions, ...this.options };

    if (this.options.initialDate instanceof Date) {
      this.currentDate = Moment(this.options.initialDate);
      this.selectDate(null, this.currentDate);
    }

    if (this.options.minDate instanceof Date) {
      this.minDate = Moment(this.options.minDate);
    } else {
      this.minDate = null;
    }

    if (this.options.maxDate instanceof Date) {
      this.maxDate = Moment(this.options.maxDate);
    } else {
      this.maxDate = null;
    }

    this.generateCalendar();
    this.outputEvents.emit({ type: 'default', data: 'init' });

    if (typeof window !== 'undefined') {
      let body = document.querySelector('body');
      body.addEventListener('click', e => {
        if (!this.opened || !e.target) { return; };
        if (this.el.nativeElement !== e.target && !this.el.nativeElement.contains((<any>e.target))) {
          this.close();
        }
      }, false);
    }

    if (this.inputEvents) {
      this.inputEvents.subscribe((e: any) => {
        if (e.type === 'action') {
          if (e.data === 'toggle') {
            this.toggle();
          }
          if (e.data === 'close') {
            this.close();
          }
          if (e.data === 'open') {
            this.open();
          }
        }

        if (e.type === 'setDate') {
          if (!(e.data instanceof Date)) {
            throw new Error(`Input data must be an instance of Date!`);
          }
          let date: moment.Moment = Moment(e.data);
          if (!date) {
            throw new Error(`Invalid date: ${e.data}`);
          }
          this.value = {
            day: date.format('DD'),
            month: date.format('MM'),
            year: date.format('YYYY'),
            formatted: date.format(this.options.format),
            momentObj: date
          };
        }
      });
    }
  }

  writeValue(value: Date) {
    if (value == undefined) {
      return undefined;
    }
    if (value instanceof Date) {
      return moment(value, this.options.format);
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
    this.onTouchedCallback = fn;
  }

  prevMonth() {
    this.currentDate = this.currentDate.subtract(1, 'month');
    this.generateCalendar();
  }

  nextMonth() {
    this.currentDate = this.currentDate.add(1, 'month');
    this.generateCalendar();
  }

  today() {
    this.currentDate = Moment();
    this.selectDate(null, this.currentDate);
  }

  toggle() {
    this.opened = !this.opened;
    if (this.opened) {
      this.onOpen();
    }

    this.outputEvents.emit({ type: 'default', data: 'opened' });
  }

  open() {
    this.opened = true;
    this.onOpen();
  }

  close() {
    this.opened = false;
    this.outputEvents.emit({ type: 'default', data: 'closed' });
  }

  onOpen() {
    this.yearPicker = false;
  }

  openYearPicker() {
    setTimeout(() => this.yearPicker = true);
  }

}
