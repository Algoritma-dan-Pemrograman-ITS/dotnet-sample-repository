using FoodDelivery.Modules.Orders.Orders.Models;
using FoodDelivery.Modules.Orders.Orders.ValueObjects;

namespace FoodDelivery.Tests.Common.Builders;

public class OrderBuilder
{
    private CustomerInfo _customerInfo = CustomerInfo.Create("John Doe", 1);
    private ProductInfo _productInfo = ProductInfo.Create("Pizza", 1, 15.99m);

    public OrderBuilder WithCustomer(string name, long id)
    {
        _customerInfo = CustomerInfo.Create(name, id);
        return this;
    }

    public OrderBuilder WithProduct(string name, long id, decimal price)
    {
        _productInfo = ProductInfo.Create(name, id, price);
        return this;
    }

    public Order Build()
    {
        return Order.Create(_customerInfo, _productInfo);
    }
}
