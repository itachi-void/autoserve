using CargoPulse.Application.Common.Interfaces;
using CargoPulse.Application.DTOs;
using CargoPulse.Domain.Entities;
using CargoPulse.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class InventoryController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;

    public InventoryController(IAppDbContext context, ICurrentUserService currentUserService)
    {
        _context = context;
        _currentUserService = currentUserService;
    }

    [HttpGet("items")]
    public async Task<ActionResult<IEnumerable<ItemDto>>> GetItems()
    {
        var items = await _context.Items
            .Include(i => i.StockLevels)
            .AsNoTracking()
            .ToListAsync();

        var result = items.Select(i => new ItemDto(
            i.Id,
            i.Sku,
            i.Barcode,
            i.NameEn,
            i.NameAr,
            i.Category,
            i.Unit,
            i.WeightKg,
            i.DeclaredPrice,
            i.StockLevels.Sum(s => s.QuantityAvailable),
            i.StockLevels.Sum(s => s.QuantityReserved)
        ));

        return Ok(result);
    }

    [HttpPost("items")]
    public async Task<ActionResult<ItemDto>> CreateItem([FromBody] CreateItemRequest request)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");

        var item = new Item
        {
            TenantId = tenantId,
            Sku = request.Sku,
            Barcode = request.Barcode,
            NameEn = request.NameEn,
            NameAr = request.NameAr,
            Category = request.Category,
            Unit = request.Unit,
            WeightKg = request.WeightKg,
            DeclaredPrice = request.DeclaredPrice
        };

        _context.Items.Add(item);
        await _context.SaveChangesAsync();

        return Ok(new ItemDto(
            item.Id,
            item.Sku,
            item.Barcode,
            item.NameEn,
            item.NameAr,
            item.Category,
            item.Unit,
            item.WeightKg,
            item.DeclaredPrice,
            0,
            0
        ));
    }

    [HttpPost("receive")]
    public async Task<ActionResult> ReceiveInventory([FromBody] ReceiveInventoryRequest request)
    {
        var item = await _context.Items.FindAsync(request.ItemId);
        if (item == null)
            return NotFound(new { message = "Item not found." });

        var warehouse = await _context.Warehouses.FindAsync(request.WarehouseId);
        if (warehouse == null)
            return NotFound(new { message = "Warehouse not found." });

        var stockLevel = await _context.StockLevels
            .FirstOrDefaultAsync(s => s.ItemId == request.ItemId && s.WarehouseId == request.WarehouseId && s.BinId == request.BinId);

        if (stockLevel == null)
        {
            stockLevel = new StockLevel
            {
                ItemId = request.ItemId,
                WarehouseId = request.WarehouseId,
                BinId = request.BinId,
                QuantityAvailable = request.Quantity
            };
            _context.StockLevels.Add(stockLevel);
        }
        else
        {
            stockLevel.QuantityAvailable += request.Quantity;
            stockLevel.LastUpdatedUtc = DateTime.UtcNow;
        }

        var movement = new StockMovement
        {
            TenantId = item.TenantId,
            ItemId = item.Id,
            TargetWarehouseId = request.WarehouseId,
            Quantity = request.Quantity,
            MovementType = MovementType.Inbound,
            ReferenceNumber = request.ReferenceNumber,
            PerformedBy = _currentUserService.UserEmail ?? "Warehouse Operator",
            Notes = request.Notes,
            TimestampUtc = DateTime.UtcNow
        };
        _context.StockMovements.Add(movement);

        await _context.SaveChangesAsync();
        return Ok(new { message = "Stock received successfully.", availableStock = stockLevel.QuantityAvailable });
    }

    [HttpGet("movements")]
    public async Task<ActionResult<IEnumerable<StockMovementDto>>> GetMovements([FromQuery] int limit = 50)
    {
        var movements = await _context.StockMovements
            .Include(m => m.Item)
            .OrderByDescending(m => m.TimestampUtc)
            .Take(limit)
            .AsNoTracking()
            .ToListAsync();

        var result = movements.Select(m => new StockMovementDto(
            m.Id,
            m.Item?.Sku ?? "—",
            m.Item?.NameEn ?? "Unknown",
            m.Item?.NameAr ?? "غير معروف",
            m.Quantity,
            m.MovementType,
            m.ReferenceNumber,
            m.PerformedBy,
            m.TimestampUtc,
            m.Notes
        ));

        return Ok(result);
    }
}
