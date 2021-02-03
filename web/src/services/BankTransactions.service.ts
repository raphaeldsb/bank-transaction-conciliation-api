import { HttpClient, HttpParams, HttpHeaders  } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BankTransactions } from '../models/BankTransactions';
import { environment } from 'src/environments/environment';
import { SearchPaging } from '../models/SearchPaging';
import { map } from 'rxjs/operators';
import { DatePipe } from '@angular/common';

@Injectable({
  providedIn: 'root'
})

export class BankTransactionsService {
  
  constructor(private http: HttpClient) {}
  
  baseURL = `${environment.apiUrl}/bank-transactions`;

  GetTransactionsByFilters(searchPaging: SearchPaging): Observable<BankTransactions> {
    const datepipe: DatePipe = new DatePipe('en-US');
    let start = datepipe.transform(searchPaging.StartDate, 'yyyy-MM-dd');
    start = start ? start.toString() : '';

    let end = datepipe.transform(searchPaging.EndDate, 'yyyy-MM-dd');
    end = end ? `${end.toString()}T23:59:59` : '';

    let params = new HttpParams();
    params = params.append('Page', searchPaging.Page.toString());
    params = params.append('Size', searchPaging.Size.toString());
    params = start != '' ? params.append('StartDate', start) : params;
    params = end != '' ? params.append('EndDate', end) : params;

    return this.http.get<BankTransactions>(`${this.baseURL}`, { params: params });
  }

  ExportToCsv(searchPaging: SearchPaging): Observable<ArrayBuffer> {
    const datepipe: DatePipe = new DatePipe('en-US');
    let start = datepipe.transform(searchPaging.StartDate, 'yyyy-MM-dd');
    start = start ? start.toString() : '';

    let end = datepipe.transform(searchPaging.EndDate, 'yyyy-MM-dd');
    end = end ? `${end.toString()}T23:59:59` : '';

    let params = new HttpParams();
    params = start != '' ? params.append('StartDate', start) : params;
    params = end != '' ? params.append('EndDate', end) : params;

    return this.http
      .get(`${this.baseURL}/csv`, { params: params, responseType: 'arraybuffer' })
      .pipe(
        map((file: ArrayBuffer) => {
            return file;
        })
    );
  }

  ImportOfx(payload: FormData) {    
    const options = {
      headers: new HttpHeaders({
          'Content-Type': 'application/x-ofx',
          'Accept': 'application/json, text/plain, application/x-ofx'
      })
    }

    console.log(payload);

    return this.http.post(`${this.baseURL}/ofs`, payload, options);
  }

}