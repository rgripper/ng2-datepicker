import { DefaultValueAccessor } from '@angular/forms/src/directives';
import { Component, OnInit, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import * as moment from 'moment';

export interface IDateModel {
  day: string;
  month: string;
  year: string;
  formatted: string;
  momentObj: moment.Moment;
}

export interface DatePickerOptions {
  autoApply: boolean;
  style: 'normal' | 'big' | 'bold';
  locale: string;
  firstWeekdaySunday: boolean;
  format: string;
  minDate?: Date;
  maxDate?: Date;
  initialDate?: Date;
}

const defaultDatePickerOptions:DatePickerOptions = { autoApply: true, style: 'normal', locale: 'en', format : 'YYYY-MM-DD', firstWeekdaySunday: true };

interface Formatter<T> {
    fromView(view: string): T;
    toView(value: T): string;
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
  @Input() options: Partial<DatePickerOptions>;

  opened = false;

  private view: string;
  private value: Date;

  constructor(private innerValueAccessor: DefaultValueAccessor, private formatter: Formatter<Date>) { }

  ngOnInit() {
    this.options = { ...defaultDatePickerOptions, ...this.options };

  }

  onBlur(): void {
      this.writeValue(this.value);
  }

  writeValue(value: any): void {
      this.value = value;
      if (value instanceof Date) { // TODO: maybe make it work with Date passed from an iframe?
          this.view = this.formatter.toView(value);
      }
      this.innerValueAccessor.writeValue(this.view);
  }

  registerOnChange(fn: any): void {
      this.innerValueAccessor.registerOnChange(view => {
          this.view = view;
          this.value = this.formatter.fromView(view);
          fn(this.value);
      });
  }

  registerOnTouched(fn: any): void {
      this.innerValueAccessor.registerOnTouched(fn);
  }

  setDisabledState(isDisabled: boolean) {
      this.innerValueAccessor.setDisabledState(isDisabled);
  }
}
