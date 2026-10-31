using Microsoft.AspNetCore.SignalR;

namespace CargoPulse.Api.Hubs;

public class TrackingHub : Hub
{
    public async Task JoinShipmentRoom(string trackingNumber)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"shipment_{trackingNumber}");
    }

    public async Task LeaveShipmentRoom(string trackingNumber)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"shipment_{trackingNumber}");
    }

    public async Task UpdateDriverLocation(string driverId, double latitude, double longitude)
    {
        await Clients.Others.SendAsync("DriverLocationUpdated", new
        {
            DriverId = driverId,
            Latitude = latitude,
            Longitude = longitude,
            Timestamp = DateTime.UtcNow
        });
    }
}
