using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace BankTransactionConciliationAPI.Models.Response
{
    public class PagingResponse
    {
        public int Page { get; set; }

        public int Size { get; set; }

        public int TotalItens { get; set; }

        public int TotalPages { get; set; }


    }
}
