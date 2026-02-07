using AutoFixture;
using FluentAssertions;
using NSubstitute;

namespace FoodDelivery.Tests.Common.TestBase;

/// <summary>
/// Base class for all unit tests.
/// Provides common functionality like AutoFixture setup and standard sets of assertions.
/// </summary>
public abstract class UnitTestBase
{
    /// <summary>
    /// Gets the <see cref="IFixture"/> instance for generating test data.
    /// </summary>
    protected IFixture Fixture { get; }

    protected UnitTestBase()
    {
        Fixture = new Fixture();
        // Eliminate recursion by omitting properties that cause circular references
        Fixture.Behaviors.OfType<ThrowingRecursionBehavior>().ToList()
            .ForEach(b => Fixture.Behaviors.Remove(b));
        Fixture.Behaviors.Add(new OmitOnRecursionBehavior());
    }

    /// <summary>
    /// Helper to create a mock object using NSubstitute.
    /// </summary>
    /// <typeparam name="T">The interface or class to mock.</typeparam>
    /// <returns>A mock instance of T.</returns>
    protected T Mock<T>() where T : class
    {
        return Substitute.For<T>();
    }
}
