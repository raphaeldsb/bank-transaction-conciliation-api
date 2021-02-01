import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'DateTimeFormatPipe'
})
export class DateTimeFormatPipePipe extends DatePipe implements PipeTransform {

  transform(value: any, args?: any): any {
    return super.transform(value, 'dd/MM/yyyy hh:mm');
  }

}
