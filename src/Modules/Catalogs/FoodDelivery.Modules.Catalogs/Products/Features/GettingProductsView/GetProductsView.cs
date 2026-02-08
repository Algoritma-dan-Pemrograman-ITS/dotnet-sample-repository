using AutoMapper;
using BuildingBlocks.Abstractions.CQRS.Query;
using FoodDelivery.Modules.Catalogs.Products.Models;
using FoodDelivery.Modules.Catalogs.Shared.Contracts;
using FluentValidation;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FoodDelivery.Modules.Catalogs.Products.Features.GettingProductsView;

public class GetProductsView : IQuery<GetProductsViewResponse>
{
    public int Page { get; init; } = 1;
    public int PageSize { get; init; } = 20;
}

public class GetProductsViewValidator : AbstractValidator<GetProductsView>
{
    public GetProductsViewValidator()
    {
        CascadeMode = CascadeMode.Stop;

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1).WithMessage("Page should at least greater than or equal to 1.");

        RuleFor(x => x.PageSize)
            .GreaterThanOrEqualTo(1).WithMessage("PageSize should at least greater than or equal to 1.");
    }
}

internal class GetProductsViewQueryHandler : IQueryHandler<GetProductsView, GetProductsViewResponse>
{
    private readonly ICatalogDbContext _catalogDbContext;
    private readonly IMapper _mapper;
    private readonly ILogger<GetProductsViewQueryHandler> _logger;

    public GetProductsViewQueryHandler(
        ICatalogDbContext catalogDbContext, 
        IMapper mapper,
        ILogger<GetProductsViewQueryHandler> logger)
    {
        _catalogDbContext = catalogDbContext;
        _mapper = mapper;
        _logger = logger;
    }

    public async Task<GetProductsViewResponse> Handle(
        GetProductsView request,
        CancellationToken cancellationToken)
    {
        var results = await _catalogDbContext.ProductsView
            .OrderBy(x => x.ProductName)
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToListAsync(cancellationToken);

        var productViewDtos = results.Select(x => new ProductViewDto(
            x.ProductId,
            x.ProductName,
            x.CategoryName,
            x.SupplierName)).ToList();

        return new GetProductsViewResponse(productViewDtos);
    }
}
