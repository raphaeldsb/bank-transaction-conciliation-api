import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { concatMap, map, merge, switchMap, tap, delay, skip } from 'rxjs/operators';
import { concat, of, Observable, BehaviorSubject, timer } from 'rxjs';
import { BsLocaleService, DateFormatter } from 'ngx-bootstrap/datepicker';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BsModalService } from 'ngx-bootstrap/modal';
import { ToastrService } from 'ngx-toastr';
import { DateTimeFormatPipePipe } from '../helps/DateTimeFormatPipe.pipe';
import { BankTransactionsService } from '../services/BankTransactions.service';
import { BankTransaction } from '../models/BankTransaction';
import { BankTransactions } from '../models/BankTransactions';


@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {

  title = 'Usuários';
  num = 1;
  modoSalvar = '';
  bankTransaction: BankTransaction = new BankTransaction();
  bankTransactions: BankTransaction[] = [];
  transactionsFilters: BankTransaction[] = [];
  requestBankTransactions: BankTransactions = new BankTransactions();
  // registerForm: FormGroup;
  modaltitle = '';
  countTransactionsTotal = 0;

  _filter = '';

  config = {
    id: 'PaginationTransactions',
    itemsPerPage: 10,
    currentPage: 1
  };

  key: string = 'bank'; // Define um valor padrão, para quando inicializar o componente
  reverse: boolean = false;
  sort(key: string) {
      this.key = key;
      this.reverse = !this.reverse;
  }

  constructor(
      private fb: FormBuilder
    , private bankTransactionsService: BankTransactionsService
    , private localeService: BsLocaleService
    , private toastr: ToastrService)
  {
    this.localeService.use('pt-br');
  }

  ngOnInit() {
    // this.validation();
    this.CarregaBankTransactions();
  }

  get filter(): string {
    return this._filter;
  }

  set filter(value: string) {
    this._filter = value;
    this.transactionsFilters = this.filter ? this.filtrarBankTransactions(this.filter) : this.bankTransactions;
  }

  filtrarBankTransactions(filtrarPor: string): BankTransaction[] {
      return this.bankTransactions.filter(
        bt => bt.description.toLocaleLowerCase().indexOf(filtrarPor.toLocaleLowerCase()) !== -1
      );
  }

  // validation() {
  //   this.registerForm = this.fb.group({
  //     userName: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
  //     email: ['', [Validators.required, Validators.email]],
  //     fullName: ['', Validators.required],
  //     status: [true, Validators.required],
  //     perfil: ['', Validators.required],
  //     password: ['']
  //   });
  // }

  CarregaBankTransactions() {
    this.bankTransactionsService.GetAllTransactions()
      .subscribe(
        (request: BankTransactions) => {
          this.bankTransactions = request.documents;
          this.transactionsFilters = request.documents;
          this.countTransactionsTotal = request.count;
          }, error => {
            console.log(error.error);
          }
      );
  }

  pageChanged(event: any) {
    this.config.currentPage = event;
  }

}