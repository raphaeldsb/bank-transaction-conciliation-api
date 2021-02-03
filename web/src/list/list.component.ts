import { Component, OnInit, EventEmitter } from '@angular/core';
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
import { SearchPaging } from '../models/SearchPaging';
import { saveAs } from 'file-saver';
import { elementEventFullName } from '@angular/compiler/src/view_compiler/view_compiler';
import { isNull } from '@angular/compiler/src/output/output_ast';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})

export class ListComponent implements OnInit {

  bankTransaction: BankTransaction = new BankTransaction();
  bankTransactions: BankTransaction[] = [];
  transactionsFilters: BankTransaction[] = [];
  requestBankTransactions: BankTransactions = new BankTransactions();
  searchPaging: SearchPaging = new SearchPaging();
  registerForm: FormGroup;
  modaltitle = '';
  countTransactionsTotal = 0;
  files!: FileList;
  fileContent !: string;

  _filter = '';

  config = {
    id: 'PaginationTransactions',
    itemsPerPage: 5,
    currentPage: 1,
    totalItems: 0
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
    , private toastr: ToastrService)
  {
    this.registerForm = this.fb.group({
      StartDate: [''],
      EndDate: ['']
    });
  }

  public formGroupFile = this.fb.group({
    file: [null, Validators.required]
  });

  ngOnInit() {
    this.FilterBankTransactions();
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

  pageChanged(event: any) {
    this.config.currentPage = event;
    this.searchPaging.Page = this.config.currentPage;
    this.searchPaging.Size = this.config.itemsPerPage;

    this.bankTransactionsService.GetTransactionsByFilters(this.searchPaging)
    .subscribe(
      (request: BankTransactions) => {
        this.bankTransactions = request.documents;
        this.transactionsFilters = request.documents;
        this.countTransactionsTotal = request.count;
        this.config.totalItems = request.count
        }, error => {
          this.toastr.error(error.error);
        }
    );
  }
  
  FilterBankTransactions() {
    if (this.registerForm.valid) {
      this.searchPaging = Object.assign({}, this.registerForm.value);
      this.searchPaging.Page = this.config.currentPage;
      this.searchPaging.Size = this.config.itemsPerPage;

      this.bankTransactionsService.GetTransactionsByFilters(this.searchPaging)
      .subscribe(
        (request: BankTransactions) => {
          this.bankTransactions = request.documents;
          this.transactionsFilters = request.documents;
          this.countTransactionsTotal = request.count;
          this.config.totalItems = request.count
          // this.toastr.success('Bank transactions filtereds');
          }, error => {
            this.toastr.error(error.error);
            console.log(error.error);
          }
      );
    }
  }

  exportToCsv() {
    if (this.registerForm.valid) {
      this.searchPaging = Object.assign({}, this.registerForm.value);

      this.bankTransactionsService.ExportToCsv(this.searchPaging)
      .subscribe(
        (data: any) => {
          const blob = new Blob([data], { type: 'application/octet-stream' });
          const fileName = 'BankTransactions.csv';
          saveAs(blob, fileName);
          this.toastr.success('Successfully generated CSV');
          }, error => {
            this.toastr.error(error.error);
          }
      );
    }
    else {
      this.toastr.error('Invalid parameters');
    }
  }

  inputOfxChange(event: any) {
    if (event.target.files && event.target.files.length) {
      this.files = event.target.files;
      console.log(this.files)
    }
  }

  importOFX() {
    for (let index = 0; index < this.files.length; index++) {
      let reader = new FileReader();

      // reader.readAsDataURL(this.files[index]);
      
      // reader.onload = () => {
      //   this.fileContent = reader.result;
      // };

      let file = this.files[0];
      let fileName = file.name;

      let payload = {
        file,
      }

      let formData: FormData = new FormData();
      formData.append('file', file, file.name);

      this.bankTransactionsService.ImportOfx(formData)
      .subscribe(
        () => {
          this.toastr.success('ok');
        }, error => {
          this.toastr.error(error.error);
        }
      );

    }
  }

  openModal(template: any) {
    template.show();
  }

  itemsPerPage(qtd: any) {
    this.config.itemsPerPage = qtd as number;
    this.FilterBankTransactions()
  }

}