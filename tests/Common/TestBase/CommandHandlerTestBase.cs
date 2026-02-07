using MediatR;

namespace FoodDelivery.Tests.Common.TestBase;

/// <summary>
/// Base class for testing Command Handlers.
/// </summary>
/// <typeparam name="TCommand">The type of the command.</typeparam>
/// <typeparam name="TResult">The type of the result produced by the handler.</typeparam>
public abstract class CommandHandlerTestBase<TCommand, TResult> : UnitTestBase
    where TCommand : IRequest<TResult>
{
    /// <summary>
    /// The handler instance under test.
    /// </summary>
    protected IRequestHandler<TCommand, TResult> Handler { get; set; } = default!;

    /// <summary>
    /// Act phase: Executes the command using the handler.
    /// </summary>
    /// <param name="command">The command to execute.</param>
    /// <param name="cancellationToken">Cancellation token.</param>
    /// <returns>The result of the command execution.</returns>
    protected async Task<TResult> Act(TCommand command, CancellationToken cancellationToken = default)
    {
        return await Handler.Handle(command, cancellationToken);
    }
}
