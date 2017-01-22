import { Component, EventEmitter, Input } from '@angular/core';

type MonthYear = { month: number; year: number };

@Component({})
export class DayPickerComponent {
    @Input()
    value?: Date;

    @Input()
    monthYear: MonthYear;

    change = new EventEmitter<Date>();

    getWeeksWithDates() {
        const dates = this.getDatesOfMonth(this.monthYear);
        return this.groupDaysByWeeks(dates);
    }

    private groupDaysByWeeks(dates: Date[]) {
        const weeks: Date[][] = [];
        dates
            .map(date => ({ 
                date,
                weekNumber: Math.floor((date.getDate() - this.getOffsetDayOfWeek(date))/7),
            }))
            .forEach(x => {
                const week = weeks[x.weekNumber] = weeks[x.weekNumber] || this.initWeek(x.date);
                const day = this.getOffsetDayOfWeek(x.date);
                week[day] = x.date;
            });
        return weeks; 
    }

    private initWeek(firstDate: Date): Date[] {
        console.log(firstDate);
        return [];
    }

    private getOffsetDayOfWeek(date: Date) {
        const startingDayOfWeek = 1;
        const day = date.getDay();
        return day == startingDayOfWeek ? 0 : day - startingDayOfWeek;
    }

    private getDatesOfMonth(monthYear: MonthYear) {
        const lastDate = new Date(monthYear.year, monthYear.month, 0);
        const dates: Date[] = [];
        for (let i = 1; i <= lastDate.getDate(); i++) {
            const date = new Date(monthYear.year, monthYear.month, i);
            dates.push(date);
        }
        return dates;
    }
}