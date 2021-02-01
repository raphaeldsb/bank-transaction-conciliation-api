using AutoMapper;
using BankTransactionConciliationAPI.Extensions;
using BankTransactionConciliationAPI.Models;
using BankTransactionConciliationAPI.Models.Request;
using BankTransactionConciliationAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using System.Text;

namespace BankTransactionConciliationAPI.Controllers
{
    [Route("bank-transactions")]
    [ApiController]
    public class BankTransactionController : BaseController
    {
        private readonly IBankTransactionService BankTransactionService;

        private readonly IMapper Mapper;


        public BankTransactionController(IMapper mapper, IBankTransactionService bankTransactionService)
        {
            this.BankTransactionService = bankTransactionService;
            this.Mapper = mapper;
        }

        [HttpGet]
        [Consumes("application/json")]
        [Produces("application/json")]
        public IActionResult Search([FromQuery] ListBankTransactionRequest request)
        {
            var filters = this.Mapper.Map<SearchPaging<BankTransactionFilters>>(request);

            var bankTransactionsResult = this.BankTransactionService.Search(filters);

            // mapear volta

            return Ok(bankTransactionsResult);
        }

        [HttpPost]
        [Consumes("application/json")]
        [Produces("application/json")]
        public IActionResult Create([FromBody] CreateBankTransactionRequest request)
        {
            // validar request

            var bankTransaction = this.Mapper.Map<BankTransaction>(request);

            var bankTransactionResult = this.BankTransactionService.Create(bankTransaction);

            return Ok(bankTransactionResult);
        }

        [HttpPost("ofx")]
        [Consumes("application/x-ofx")]
        [Produces("application/json")]
        public IActionResult CreateMany()
        {
            if (this.Request.ContentType != "application/x-ofx")
            {
                return new UnsupportedMediaTypeResult();
            }
            //throw new System.Exception("asdsad");
            var ofx = this.Request.AsString();

            var bankTransactionsResult = this.BankTransactionService.CreateMany(ofx);

            return Ok(bankTransactionsResult);
        }

        [HttpGet("csv")]
        [Consumes("application/json")]
        [Produces("text/csv")]
        public IActionResult ExportToCsv([FromQuery] ExportBankTransactionsToCsvRequest request)
        {
            var filters = this.Mapper.Map<BankTransactionFilters>(request);

            var csvString = this.BankTransactionService.ExportToCsv(filters);

            var csv = Encoding.ASCII.GetBytes(csvString);

            this.Response.Headers.Add("Content-Disposition", $"inline; filename=\"BankTransactionReport.csv\"");
            return new FileContentResult(csv, "text/csv");
        }


    }
}