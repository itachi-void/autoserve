using FixSys.Application.Abstractions;
using FixSys.Application.Common;
using FixSys.Domain.Common;
using FixSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace FixSys.Application.Customers;

public record CreateCustomerInput(string Name, string Phone, string? Email, string? Address, CustomerType Type);
public record UpdateCustomerInput(Guid Id, string? Name, string? Phone, string? Email, string? Address, CustomerType? Type, ActiveStatus? Status);
public record CreateVehicleInput(
    Guid CustomerId, string Plate, string Make, string Model, int Year, string? Trim, string Color, string Vin, int Mileage);

public class CustomerService(IAppDbContext db)
{
    public async Task<Customer> CreateAsync(CreateCustomerInput input, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(input.Name)) throw new AppException("اسم العميل مطلوب");
        if (string.IsNullOrWhiteSpace(input.Phone)) throw new AppException("رقم الجوال مطلوب");

        var phone = input.Phone.Trim();
        if (await db.Customers.AnyAsync(c => c.Phone == phone, ct))
            throw new AppException("يوجد عميل مسجل بنفس رقم الجوال", "DUPLICATE");

        var customer = new Customer
        {
            Name = input.Name.Trim(),
            Phone = phone,
            Email = input.Email?.Trim(),
            Address = input.Address?.Trim(),
            Type = input.Type,
        };
        db.Customers.Add(customer);
        await db.SaveChangesAsync(ct);
        return customer;
    }

    public async Task<Customer> UpdateAsync(UpdateCustomerInput input, CancellationToken ct)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == input.Id, ct)
            ?? throw new AppException("العميل غير موجود", "NOT_FOUND");

        customer.Name = input.Name?.Trim() ?? customer.Name;
        customer.Phone = input.Phone?.Trim() ?? customer.Phone;
        customer.Email = input.Email?.Trim() ?? customer.Email;
        customer.Address = input.Address?.Trim() ?? customer.Address;
        customer.Type = input.Type ?? customer.Type;
        customer.Status = input.Status ?? customer.Status;
        await db.SaveChangesAsync(ct);
        return customer;
    }

    public async Task<Vehicle> CreateVehicleAsync(CreateVehicleInput input, CancellationToken ct)
    {
        var customer = await db.Customers.FirstOrDefaultAsync(c => c.Id == input.CustomerId, ct)
            ?? throw new AppException("العميل غير موجود", "NOT_FOUND");

        var plate = input.Plate.Trim();
        if (await db.Vehicles.AnyAsync(v => v.Plate == plate, ct))
            throw new AppException("رقم اللوحة مسجل مسبقاً", "DUPLICATE");

        var vehicle = new Vehicle
        {
            CustomerId = customer.Id,
            Plate = plate,
            Make = input.Make.Trim(),
            Model = input.Model.Trim(),
            Year = input.Year,
            Trim = input.Trim?.Trim(),
            Color = input.Color.Trim(),
            Vin = input.Vin.Trim().ToUpperInvariant(),
            Mileage = input.Mileage,
            BranchId = customer.BranchId,
        };
        vehicle.OwnershipHistory.Add(new VehicleOwnership { CustomerId = customer.Id });
        db.Vehicles.Add(vehicle);
        await db.SaveChangesAsync(ct);
        return vehicle;
    }
}
