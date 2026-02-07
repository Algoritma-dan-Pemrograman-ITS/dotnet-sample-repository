using MediatR;

namespace FoodDelivery.Tests.Common.TestBase;

/// <summary>
/// Base class for testing Query Handlers.
/// </summary>
/// <typeparam name="TQuery">The type of the query.</typeparam>
/// <typeparam name="TResult">The type of the result produced by the handler.</typeparam>
public abstract class QueryHandlerTestBase<TQuery, TResult> : UnitTestBase
    where TQuery : IRequest<TResult>
{
    /// <summary>
    /// The handler instance under test.
    /// </summary>
    protected IRequestHandler<TQuery, TResult> Handler { get; set; } = default!;

    /// <summary>
    /// Act phase: Executes the query using the handler.
    /// </summary>
    /// <param name="query">The query to execute.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the query execution.</returns>
    protected async Task<TResult> Act(TQuery query, CancellationToken cancellationToken = default)
    {
        return await Handler.Handle(query, cancellationToken);
    }
}
