using CargoPulse.Application.Common.Interfaces;
using CargoPulse.Domain.Entities;
using CargoPulse.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace CargoPulse.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SettlementsController : ControllerBase
{
    private readonly IAppDbContext _context;

    public SettlementsController(IAppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<DriverSettlement>>> GetSettlements()
    {
        var settlements = await _context.DriverSettlements
            .OrderByDescending(s => s.SettlementDateUtc)
            .AsNoTracking()
            .ToListAsync();

        return Ok(settlements);
    }

    [HttpPost("{id}/reconcile")]
    public async Task<ActionResult> Reconcile(Guid id, [FromBody] decimal actualCashCollected)
    {
        var settlement = await _context.DriverSettlements.FindAsync(id);
        if (settlement == null)
            return NotFound(new { message = "Settlement record not found." });

        settlement.CollectedCodAmount = actualCashCollected;
        settlement.Status = (settlement.DifferenceAmount == 0)
            ? SettlementStatus.Reconciled
            : SettlementStatus.Discrepancy;

        await _context.SaveChangesAsync();
        return Ok(settlement);
    }
}
