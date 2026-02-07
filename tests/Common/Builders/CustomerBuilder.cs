using BuildingBlocks.Core.Domain.ValueObjects;
using FoodDelivery.Modules.Customers.Customers.Models;
using FoodDelivery.Modules.Customers.Customers.ValueObjects;

namespace FoodDelivery.Tests.Common.Builders;

public class CustomerBuilder
{
    private CustomerId _id = new(1);
    private Email _email = Email.Create("test@example.com");
    private CustomerName _name = CustomerName.Create("John", "Doe");
    private Guid _identityId = Guid.NewGuid();
    
    // Optional properties
    private Address? _address = null;
    private Nationality? _nationality = null;
    private BirthDate? _birthDate = null;
    private PhoneNumber? _phoneNumber = null;

    public CustomerBuilder WithId(long id)
    {
        _id = new CustomerId(id);
        return this;
    }

    public CustomerBuilder WithEmail(string email)
    {
        _email = Email.Create(email);
        return this;
    }

    public CustomerBuilder WithName(string firstName, string lastName)
    {
        _name = CustomerName.Create(firstName, lastName);
        return this;
    }

    public CustomerBuilder WithIdentityId(Guid identityId)
    {
        _identityId = identityId;
        return this;
    }

    public CustomerBuilder WithAddress(string country, string city, string detail)
    {
        _address = Address.Create(country, city, detail);
        return this;
    }

    public CustomerBuilder WithPhoneNumber(string phoneNumber)
    {
        _phoneNumber = PhoneNumber.Create(phoneNumber);
        return this;
    }

    public CustomerBuilder WithBirthDate(DateTime birthDate)
    {
        _birthDate = BirthDate.Create(birthDate);
        return this;
    }
    
    // Method to build the customer using reflection since properties are private set
    // and factory method might not expose all optional fields if they are not in the constructor/factory.
    // Looking at Customer.cs, Create method only takes id, email, name, identityId.
    // Other fields seem to be set via domain methods or public setters if available?
    // Checking Customer.cs again...
    // It seems Address, Nationality, BirthDate, PhoneNumber are just properties with private setters.
    // And there are no methods to change them in the code I saw?
    // Wait, let me check Customer.cs again to see how to set Address etc.
    // If there are no methods, I might need to use reflection or just stick to what Create allows.
    // User asked for builders.
    
    public Customer Build()
    {
        var customer = Customer.Create(_id, _email, _name, _identityId);
        
        // If there are methods to set other properties, use them here.
        // If not, and since this is a test builder, we might need to use reflection to set private properties
        // if we want to test those states, OR the domain model is incomplete.
        // For now, I will use reflection to set optional properties if they are not null, 
        // assuming the domain model might get update methods later or we need to force state for tests.
        
        if (_address != null)
        {
            typeof(Customer).GetProperty(nameof(Customer.Address))?.SetValue(customer, _address);
        }
        
        if (_phoneNumber != null)
        {
            typeof(Customer).GetProperty(nameof(Customer.PhoneNumber))?.SetValue(customer, _phoneNumber);
        }
        
        if (_birthDate != null)
        {
            typeof(Customer).GetProperty(nameof(Customer.BirthDate))?.SetValue(customer, _birthDate);
        }

        return customer;
    }
}
