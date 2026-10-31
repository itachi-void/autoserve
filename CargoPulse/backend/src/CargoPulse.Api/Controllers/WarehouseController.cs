using CargoPulse.Application.Common.Interfaces;
using CargoPulse.Application.DTOs;
using CargoPulse.Domain.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WarehouseController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public WarehouseController(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<WarehouseDto>>> GetWarehouses()
    {
        var warehouses = await _context.Warehouses
            .Include(w => w.Zones)
                .ThenInclude(z => z.Bins)
            .AsNoTracking()
            .ToListAsync();

        var dtos = warehouses.Select(w =>
        {
            var totalBins = w.Zones.SelectMany(z => z.Bins).Count();
            var occupiedBins = w.Zones.SelectMany(z => z.Bins).Count(b => b.IsOccupied);
            return new WarehouseDto(
                w.Id,
                w.Name,
                w.NameAr,
                w.Code,
                w.City,
                w.Address,
                w.CapacitySqMeters,
                w.IsActive,
                totalBins,
                occupiedBins
            );
        });

        return Ok(dtos);
    }

    [HttpPost]
    public async Task<ActionResult<WarehouseDto>> CreateWarehouse([FromBody] CreateWarehouseRequest request)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var warehouse = new Warehouse
        {
            TenantId = tenantId,
            Name = request.Name,
            NameAr = request.NameAr,
            Code = request.Code,
            City = request.City,
            Address = request.Address,
            CapacitySqMeters = request.CapacitySqMeters,
            IsActive = true
        };

        _context.Warehouses.Add(warehouse);
        await _context.SaveChangesAsync();

        return Ok(new WarehouseDto(
            warehouse.Id,
            warehouse.Name,
            warehouse.NameAr,
            warehouse.Code,
            warehouse.City,
            warehouse.Address,
            warehouse.CapacitySqMeters,
            warehouse.IsActive,
            0,
            0
        ));
    }
}
