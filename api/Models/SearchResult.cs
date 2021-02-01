using System.Collections.Generic;

namespace BankTransactionConciliationAPI.Models
{
    public class SearchResult<T>
    {
        public long Count { get; set; }

        public List<T> Documents { get; set; }
    }
}
