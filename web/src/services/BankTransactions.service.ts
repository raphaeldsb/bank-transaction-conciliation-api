import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BankTransactions } from '../models/BankTransactions';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})

export class BankTransactionsService {
  
  constructor(private http: HttpClient) {}
  
  baseURL = `${environment.apiUrl}/bank-transactions`;

  GetAllTransactions(): Observable<BankTransactions> {
   return this.http.get<BankTransactions>(this.baseURL);
  }
 
  ExportToCsv(): Observable<BankTransactions> {
    return this.http.get<BankTransactions>(`${this.baseURL}/csv`);
  }

  // postApi(api: Api) {
  //   return this.http.post(this.baseURL, api);
  // }

}