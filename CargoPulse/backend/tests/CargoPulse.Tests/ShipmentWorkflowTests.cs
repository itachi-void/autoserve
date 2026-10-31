using CargoPulse.Domain.Entities;
using CargoPulse.Domain.Enums;
using Xunit;

namespace CargoPulse.Tests;

public class ShipmentWorkflowTests
{
    [Fact]
    public void Shipment_ValidStateTransition_ShouldSucceedAndRecordEvent()
    {
        // Arrange
        var shipment = new Shipment
        {
            Id = Guid.NewGuid(),
            TrackingNumber = "CP-123456-SA",
            Status = ShipmentStatus.Created
        };

        // Act
        shipment.TransitionTo(ShipmentStatus.Received, "Operator A", "Received at Riyadh Hub", "RUH-01");

        // Assert
        Assert.Equal(ShipmentStatus.Received, shipment.Status);
        Assert.Single(shipment.Events);
        Assert.Equal(ShipmentStatus.Created, shipment.Events.First().PreviousStatus);
        Assert.Equal(ShipmentStatus.Received, shipment.Events.First().NewStatus);
        Assert.Equal("Operator A", shipment.Events.First().Actor);
    }

    [Fact]
    public void Shipment_InvalidStateTransition_ShouldThrowException()
    {
        // Arrange
        var shipment = new Shipment
        {
            Id = Guid.NewGuid(),
            TrackingNumber = "CP-999999-SA",
            Status = ShipmentStatus.Created
        };

        // Act & Assert: Directly going from Created to Delivered must fail!
        var ex = Assert.Throws<InvalidOperationException>(() =>
            shipment.TransitionTo(ShipmentStatus.Delivered, "Driver", "Delivered bypass"));

        Assert.Contains("Invalid status transition", ex.Message);
        Assert.Equal(ShipmentStatus.Created, shipment.Status);
    }

    [Fact]
    public void ProofOfDelivery_WhenCaptured_SetsDeliveredStatusAndTimestamp()
    {
        // Arrange
        var shipment = new Shipment
        {
            Id = Guid.NewGuid(),
            TrackingNumber = "CP-777888-SA",
            Status = ShipmentStatus.OutForDelivery,
            CodAmount = 450.00m,
            PaymentMethod = PaymentMethod.CashOnDelivery,
            IsCodCollected = false
        };

        // Act
        shipment.ProofOfDelivery = new ProofOfDelivery
        {
            ShipmentId = shipment.Id,
            RecipientName = "Ahmed Al-Harbi",
            SignatureData = "sig_data_base64",
            PhotoEvidenceUrl = "photo_url",
            Latitude = 24.7136,
            Longitude = 46.6753
        };
        shipment.IsCodCollected = true;
        shipment.TransitionTo(ShipmentStatus.Delivered, "Driver Sami", "Handed over to customer", "Riyadh");

        // Assert
        Assert.Equal(ShipmentStatus.Delivered, shipment.Status);
        Assert.NotNull(shipment.DeliveredAtUtc);
        Assert.True(shipment.IsCodCollected);
        Assert.NotNull(shipment.ProofOfDelivery);
    }

    [Theory]
    [InlineData(500, 500, SettlementStatus.Reconciled, 0)]
    [InlineData(500, 450, SettlementStatus.Discrepancy, -50)]
    [InlineData(500, 520, SettlementStatus.Discrepancy, 20)]
    public void DriverSettlement_DifferenceCalculation_ShouldMatchExpected(
        decimal expectedCod, decimal collectedCod, SettlementStatus expectedStatus, decimal expectedDiff)
    {
        // Arrange & Act
        var settlement = new DriverSettlement
        {
            DriverId = Guid.NewGuid(),
            DriverName = "Driver 1",
            ExpectedCodAmount = expectedCod,
            CollectedCodAmount = collectedCod,
            Status = (collectedCod == expectedCod) ? SettlementStatus.Reconciled : SettlementStatus.Discrepancy
        };

        // Assert
        Assert.Equal(expectedDiff, settlement.DifferenceAmount);
        Assert.Equal(expectedStatus, settlement.Status);
    }

    [Fact]
    public void VolumetricWeight_Calculation_ShouldFollowStandardFormula()
    {
        // Arrange: 50cm x 40cm x 30cm / 5000 = 12.0 kg
        var shipment = new Shipment
        {
            LengthCm = 50m,
            WidthCm = 40m,
            HeightCm = 30m,
            WeightKg = 5.0m
        };

        // Act
        var volWeight = shipment.VolumetricWeightKg;

        // Assert
        Assert.Equal(12.0m, volWeight);
    }
}
