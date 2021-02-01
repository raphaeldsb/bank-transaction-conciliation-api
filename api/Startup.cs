using AutoMapper;
using BankTransactionConciliationAPI.Extensions;
using BankTransactionConciliationAPI.MIddlewares;
using BankTransactionConciliationAPI.Models;
using BankTransactionConciliationAPI.Models.Request;
using BankTransactionConciliationAPI.Models.Response;
using BankTransactionConciliationAPI.Models.Settings;
using BankTransactionConciliationAPI.Parsers;
using BankTransactionConciliationAPI.Parsers.Interfaces;
using BankTransactionConciliationAPI.Repository;
using BankTransactionConciliationAPI.Repository.Interfaces;
using BankTransactionConciliationAPI.Services;
using BankTransactionConciliationAPI.Services.Interfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using Swashbuckle.AspNetCore.Swagger;
using Swashbuckle.Swagger;
using System.Text.Json;
using System.Text.Json.Serialization;

namespace BankTransactionConciliationAPI
{
    public class Startup
    {
        private static IConfiguration Configuration { get; set; }

        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            services
               .AddControllers()
               .AddJsonOptions(opts =>
               {
                   opts.JsonSerializerOptions.PropertyNamingPolicy = SnakeCaseNamingPolicy.Instance;
                   opts.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
               });

            services.AddScoped<IBankTransactionService, BankTransactionService>();
            services.AddScoped<IBankTransactionRepository, BankTransactionRepository>();
            services.AddSingleton<ICsvParser, CsvParser>();
            services.AddSingleton<IOfxParser, OfxParser>();

            this.ConfigureMapper(services);
            this.ConfigureMongo(services);
            this.ConfigureSwagger(services);
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseRouting();
            app.UseCustomExceptionHandler();

            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.RoutePrefix = "swagger";
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Api v1");
            });

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }

        private void ConfigureMapper(IServiceCollection services)
        {
            var mapperConfiguration = new MapperConfiguration(config =>
            {
                config.CreateMap<CreateBankTransactionRequest, BankTransaction>();
                config.CreateMap<BankTransaction, GetBankTransactionResponse>();
                config.CreateMap<ExportBankTransactionsToCsvRequest, BankTransactionFilters>();
                config.CreateMap<ListBankTransactionRequest, SearchPaging<BankTransactionFilters>>()
                    .ForPath(dest => dest.Filters.StartDate, opt => opt.MapFrom(src => src.StartDate))
                    .ForPath(dest => dest.Filters.EndDate, opt => opt.MapFrom(src => src.EndDate));
            });

            IMapper mapper = mapperConfiguration.CreateMapper();
            services.AddSingleton(mapper);
        }

        public void ConfigureMongo(IServiceCollection services)
        {
            services.Configure<MongoSettings>(options => Configuration.GetSection("MongoConnection").Bind(options));

            services.AddSingleton<IMongoDatabase>(provider => 
            {
                var settings = provider.GetService<IOptions<MongoSettings>>().Value;
                var mongoUrl = new MongoUrl(settings.ConnectionString);
                IMongoClient client = new MongoClient(mongoUrl);
                return client.GetDatabase(settings.Database);
            });
        }

        public void ConfigureSwagger(IServiceCollection services)
        {
            services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1",
                    new Microsoft.OpenApi.Models.OpenApiInfo
                    {
                        Title = "Bank Transaction Conciliation Api",
                        Version = "v1"
                    });
            });
        }

        public class SnakeCaseNamingPolicy : JsonNamingPolicy
        {
            public static SnakeCaseNamingPolicy Instance { get; } = new SnakeCaseNamingPolicy();

            public override string ConvertName(string name)
            {
                return name.ToSnakeCase();
            }
        }
    }
}
