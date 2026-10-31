using CargoPulse.Api.Hubs;
using CargoPulse.Application.Common.Interfaces;
using CargoPulse.Application.DTOs;
using CargoPulse.Domain.Entities;
using CargoPulse.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShipmentsController : ControllerBase
{
    private readonly IAppDbContext _context;
    private readonly ICurrentUserService _currentUserService;
    private readonly IHubContext<TrackingHub> _hubContext;

    public ShipmentsController(
        IAppDbContext context,
        ICurrentUserService currentUserService,
        IHubContext<TrackingHub> hubContext)
    {
        _context = context;
        _currentUserService = currentUserService;
        _hubContext = hubContext;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShipmentDto>>> GetShipments(
        [FromQuery] string? search,
        [FromQuery] ShipmentStatus? status,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50)
    {
        var query = _context.Shipments
            .Include(s => s.CurrentBin)
            .Include(s => s.Events.OrderByDescending(e => e.TimestampUtc))
            .AsNoTracking();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var s = search.Trim().ToLower();
            query = query.Where(x =>
                x.TrackingNumber.ToLower().Contains(s) ||
                x.Barcode.ToLower().Contains(s) ||
                x.SenderName.ToLower().Contains(s) ||
                x.RecipientName.ToLower().Contains(s) ||
                x.RecipientPhone.Contains(s));
        }

        if (status.HasValue)
        {
            query = query.Where(x => x.Status == status.Value);
        }

        var shipments = await query
            .OrderByDescending(x => x.CreatedAtUtc)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        var result = shipments.Select(MapToDto);
        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ShipmentDto>> GetShipmentById(Guid id)
    {
        var shipment = await _context.Shipments
            .Include(s => s.CurrentBin)
            .Include(s => s.Events.OrderByDescending(e => e.TimestampUtc))
            .Include(s => s.ProofOfDelivery)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null)
            return NotFound(new { message = "Shipment not found." });

        return Ok(MapToDto(shipment));
    }

    [HttpGet("tracking/{trackingNumber}")]
    public async Task<ActionResult<ShipmentDto>> TrackShipment(string trackingNumber)
    {
        var shipment = await _context.Shipments
            .IgnoreQueryFilters()
            .Include(s => s.Events.OrderByDescending(e => e.TimestampUtc))
            .FirstOrDefaultAsync(s => s.TrackingNumber.ToLower() == trackingNumber.Trim().ToLower());

        if (shipment == null)
            return NotFound(new { message = "Tracking number not found." });

        return Ok(MapToDto(shipment));
    }

    [HttpPost]
    public async Task<ActionResult<ShipmentDto>> CreateShipment([FromBody] CreateShipmentRequest request)
    {
        var tenantId = _currentUserService.TenantId ?? Guid.Parse("11111111-1111-1111-1111-111111111111");
        var trackingNo = "CP-" + Random.Shared.Next(100000, 999999) + "-SA";
        var barcode = trackingNo.Replace("-", "");

        var shipment = new Shipment
        {
            TenantId = tenantId,
            TrackingNumber = trackingNo,
            Barcode = barcode,
            SenderName = request.SenderName,
            SenderPhone = request.SenderPhone,
            SenderCity = request.SenderCity,
            SenderAddress = request.SenderAddress,
            RecipientName = request.RecipientName,
            RecipientPhone = request.RecipientPhone,
            RecipientCity = request.RecipientCity,
            RecipientAddress = request.RecipientAddress,
            RecipientLatitude = request.RecipientLatitude,
            RecipientLongitude = request.RecipientLongitude,
            OriginWarehouseId = request.OriginWarehouseId,
            DestinationWarehouseId = request.DestinationWarehouseId,
            WeightKg = request.WeightKg,
            LengthCm = request.LengthCm,
            WidthCm = request.WidthCm,
            HeightCm = request.HeightCm,
            DeclaredValue = request.DeclaredValue,
            ShippingFee = request.ShippingFee,
            CodAmount = request.CodAmount,
            PaymentMethod = request.PaymentMethod,
            Status = ShipmentStatus.Created
        };

        shipment.Events.Add(new ShipmentEvent
        {
            PreviousStatus = ShipmentStatus.Created,
            NewStatus = ShipmentStatus.Created,
            Actor = _currentUserService.UserEmail ?? "System Operator",
            Location = request.SenderCity,
            Notes = "Shipment waybill created in system",
            TimestampUtc = DateTime.UtcNow
        });

        _context.Shipments.Add(shipment);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetShipmentById), new { id = shipment.Id }, MapToDto(shipment));
    }

    [HttpPost("{id}/status")]
    public async Task<ActionResult<ShipmentDto>> UpdateStatus(Guid id, [FromBody] UpdateShipmentStatusRequest request)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Events)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null)
            return NotFound(new { message = "Shipment not found." });

        var actor = _currentUserService.UserEmail ?? "System Operator";

        try
        {
            shipment.TransitionTo(request.TargetStatus, actor, request.Notes, request.Location);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }

        await _context.SaveChangesAsync();

        // Broadcast live update via SignalR
        await _hubContext.Clients.Group($"shipment_{shipment.TrackingNumber}")
            .SendAsync("ShipmentStatusUpdated", new
            {
                TrackingNumber = shipment.TrackingNumber,
                Status = shipment.Status.ToString(),
                Location = request.Location,
                Timestamp = DateTime.UtcNow
            });

        return Ok(MapToDto(shipment));
    }

    [HttpPost("{id}/assign-driver")]
    public async Task<ActionResult<ShipmentDto>> AssignDriver(Guid id, [FromBody] AssignDriverRequest request)
    {
        var shipment = await _context.Shipments.FindAsync(id);
        if (shipment == null)
            return NotFound(new { message = "Shipment not found." });

        shipment.AssignedDriverId = request.DriverId;
        shipment.AssignedDriverName = request.DriverName;
        shipment.VehiclePlate = request.VehiclePlate;

        await _context.SaveChangesAsync();
        return Ok(MapToDto(shipment));
    }

    [HttpPost("{id}/pod")]
    public async Task<ActionResult<ShipmentDto>> CaptureProofOfDelivery(Guid id, [FromBody] CapturePodRequest request)
    {
        var shipment = await _context.Shipments
            .Include(s => s.Events)
            .Include(s => s.ProofOfDelivery)
            .FirstOrDefaultAsync(s => s.Id == id);

        if (shipment == null)
            return NotFound(new { message = "Shipment not found." });

        var pod = new ProofOfDelivery
        {
            ShipmentId = shipment.Id,
            RecipientName = request.RecipientName,
            SignatureData = request.SignatureData,
            PhotoEvidenceUrl = request.PhotoEvidenceUrl,
            Latitude = request.Latitude,
            Longitude = request.Longitude,
            Notes = request.Notes,
            TimestampUtc = DateTime.UtcNow
        };

        shipment.ProofOfDelivery = pod;
        shipment.IsCodCollected = request.CodCollected;

        if (shipment.CanTransitionTo(ShipmentStatus.Delivered))
        {
            shipment.TransitionTo(
                ShipmentStatus.Delivered,
                _currentUserService.UserEmail ?? "Driver Delivery Agent",
                request.Notes,
                $"{request.Latitude:F5}, {request.Longitude:F5}"
            );
        }

        await _context.SaveChangesAsync();
        return Ok(MapToDto(shipment));
    }

    private static ShipmentDto MapToDto(Shipment s) => new(
        s.Id,
        s.TrackingNumber,
        s.Barcode,
        s.SenderName,
        s.SenderPhone,
        s.SenderCity,
        s.SenderAddress,
        s.RecipientName,
        s.RecipientPhone,
        s.RecipientCity,
        s.RecipientAddress,
        s.Status,
        s.WeightKg,
        s.VolumetricWeightKg,
        s.ShippingFee,
        s.CodAmount,
        s.PaymentMethod,
        s.IsCodCollected,
        s.AssignedDriverId,
        s.AssignedDriverName,
        s.VehiclePlate,
        s.CurrentBin?.BinCode ?? "—",
        s.CreatedAtUtc,
        s.DeliveredAtUtc,
        s.Events.Select(e => new ShipmentEventDto(
            e.Id,
            e.PreviousStatus,
            e.NewStatus,
            e.Actor,
            e.Location,
            e.Notes,
            e.TimestampUtc
        )).ToList()
    );
}
