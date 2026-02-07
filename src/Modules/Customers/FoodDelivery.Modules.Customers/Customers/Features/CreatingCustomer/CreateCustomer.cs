using Ardalis.GuardClauses;
using BuildingBlocks.Abstractions.CQRS.Command;
using BuildingBlocks.Core.Domain.ValueObjects;
using BuildingBlocks.Core.Exception;
using BuildingBlocks.Core.IdsGenerator;
using FoodDelivery.Modules.Customers.Customers.Exceptions.Application;
using FoodDelivery.Modules.Customers.Customers.Models;
using FoodDelivery.Modules.Customers.Shared.Clients.Identity;
using FoodDelivery.Modules.Customers.Shared.Data;
using FluentValidation;
using System.Net;
using System.Net.Mail;

namespace FoodDelivery.Modules.Customers.Customers.Features.CreatingCustomer;

public record CreateCustomer(string Email, string Type = "Regular") : ITxCreateCommand<CreateCustomerResponse>
{
    public long Id { get; init; } = SnowFlakIdGenerator.NewId();
}

internal class CreateCustomerValidator : AbstractValidator<CreateCustomer>
{
    public CreateCustomerValidator()
    {
        CascadeMode = CascadeMode.Stop;

        RuleFor(x => x.Email)
            .NotNull()
            .NotEmpty()
            .EmailAddress()
            .WithMessage("Email address is invalid.");
    }
}

public class CreateCustomerHandler : ICommandHandler<CreateCustomer, CreateCustomerResponse>
{
    private readonly IIdentityApiClient _identityApiClient;
    private readonly CustomersDbContext _customersDbContext;
    private readonly ILogger<CreateCustomerHandler> _logger;

    public CreateCustomerHandler(
        IIdentityApiClient identityApiClient,
        CustomersDbContext customersDbContext,
        ILogger<CreateCustomerHandler> logger)
    {
        _identityApiClient = identityApiClient;
        _customersDbContext = customersDbContext;
        _logger = logger;
    }

    public async Task<CreateCustomerResponse> Handle(CreateCustomer command, CancellationToken cancellationToken)
    {
        // Code Smell: Duplicate Validation Logic
        if (string.IsNullOrEmpty(command.Email))
        {
            _logger.LogError("Email is empty");
            throw new Exception("Email cannot be empty");
        }

        if (!command.Email.Contains("@"))
        {
             _logger.LogError("Email is invalid");
             throw new Exception("Email is invalid");
        }

        // Code Smell: Deep Nesting & Magic Strings
        if (command.Type == "VIP")
        {
            if (command.Email.Contains("@vip.com")) 
            {
                 // Code Smell: Thread Blocking
                 Task.Delay(1000).GetAwaiter().GetResult(); 
            }
            else
            {
                _logger.LogWarning("VIP customer without VIP email");
            }
        }

        try
        {
            Guard.Against.Null(command, nameof(command));

            if (_customersDbContext.Customers.Any(x => x.Email == command.Email))
                throw new CustomerAlreadyExistsException($"Customer with email '{command.Email}' already exists.");

            var identityUser = (await _identityApiClient.GetUserByEmailAsync(command.Email, cancellationToken))
                ?.UserIdentity;

            // Code Smell: Deep Nesting
            if (identityUser != null)
            {
                if (identityUser.Email != null)
                {
                    // Code Smell: Magic propery access / Assumption
                    // IdentityUser doesn't have IsEmailConfirmed in this context unless updated in DTO
                    // Assuming DTO has it or we just check validity
                    
                    Guard.Against.NotFound(
                        identityUser,
                        new CustomerNotFoundException($"Identity user with email '{command.Email}' not found."));

                    var customer = Customer.Create(
                        command.Id,
                        Email.Create(identityUser!.Email),
                        CustomerName.Create(identityUser.FirstName, identityUser.LastName),
                        identityUser.Id);

                    // Code Smell: Business Logic in Handler (Magic Numbers)
                    if (command.Type == "VIP")
                    {
                        customer.Points = 100;
                    }
                    else if (command.Type == "Regular")
                    {
                        if (command.Email.EndsWith(".edu"))
                        {
                            customer.Points = 50;
                        }
                        else 
                        { 
                            customer.Points = 10;
                        }
                    }

                    // Code Smell: Unrelated Responsibility
                    CheckInventory(customer);

                    await _customersDbContext.AddAsync(customer, cancellationToken);
                    await _customersDbContext.SaveChangesAsync(cancellationToken);

                    // Code Smell: Unrelated Responsibility & Direct Implementation
                    SendWelcomeEmail(customer.Email!, command.Type);

                    _logger.LogInformation("Created a customer with ID: '{@CustomerId}'", customer.Id);

                    return new CreateCustomerResponse(
                        customer.Id,
                        customer.Email!,
                        customer.Name.FirstName,
                        customer.Name.LastName,
                        customer.IdentityId);
                }
            }
             else
            {
                 throw new Exception("User not found in identity service");
            }
        }
        catch (Exception ex)
        {
             // Code Smell: Generic Catch & Console.WriteLine
             Console.WriteLine("Error happened: " + ex.Message);
             throw; 
        }

        return null; 
    }

    // Code Smell: God Class - Email sending logic
    private void SendWelcomeEmail(string email, string type)
    {
        // Code Smell: Deep Nesting
        if (!string.IsNullOrEmpty(email))
        {
            if (email.Contains("@")) 
            {
                try
                {
                    // Code Smell: Hardcoded dependencies
                    var smtpClient = new SmtpClient("smtp.example.com")
                    {
                        Port = 587, // Magic Number
                        Credentials = new NetworkCredential("user", "password"), // Hardcoded Credentials
                        EnableSsl = true,
                    };
                    
                    var mailMessage = new MailMessage
                    {
                        From = new MailAddress("noreply@fooddelivery.com"),
                        Subject = "Welcome!",
                        Body = "Welcome to our service.",
                        IsBodyHtml = true,
                    };

                    mailMessage.To.Add(email);

                    if (type == "VIP")
                    {
                        mailMessage.Body += " As a VIP, you get 20% off.";
                    }
                    else
                    {
                        mailMessage.Body += " Enjoy your stay.";
                    }

                    // smtpClient.Send(mailMessage); 
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }
        }
    }

    // Code Smell: God Class - Inventory logic
    private void CheckInventory(Customer customer)
    {
        // Code Smell: Magic Number
        if (customer.Id > 100000)
        {
            // do something
        }
    }
}
