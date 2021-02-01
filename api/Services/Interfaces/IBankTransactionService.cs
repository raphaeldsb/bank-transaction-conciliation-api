using BankTransactionConciliationAPI.Models;
using System;
using System.Collections.Generic;

namespace BankTransactionConciliationAPI.Services.Interfaces
{
    public interface IBankTransactionService
    {
        BankTransaction Create(BankTransaction bankTransaction);

        List<BankTransaction> CreateMany(string ofx);

        SearchResult<BankTransaction> Search(SearchPaging<BankTransactionFilters> bankTransactionFilters);

        string ExportToCsv(BankTransactionFilters bankTransactionFilters);
    }
}
