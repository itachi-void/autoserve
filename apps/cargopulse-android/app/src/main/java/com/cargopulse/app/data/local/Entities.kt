package com.cargopulse.app.data.local

import androidx.room.*

@Entity(tableName = "shipments")
data class ShipmentEntity(
    @PrimaryKey val id: String,
    val trackingNumber: String,
    val barcode: String,
    val senderName: String,
    val senderCity: String,
    val recipientName: String,
    val recipientPhone: String,
    val recipientCity: String,
    val recipientAddress: String,
    val status: String,
    val weightKg: Double,
    val volumetricWeightKg: Double,
    val shippingFee: Double,
    val codAmount: Double,
    val isCodCollected: Boolean,
    val currentBinCode: String,
    val assignedDriverName: String,
    val createdAtUtc: String,
    val isSynced: Boolean = true
)

@Entity(tableName = "sync_queue")
data class SyncQueueEntity(
    @PrimaryKey val operationId: String,
    val entityType: String, // "SHIPMENT_STATUS", "POD_SUBMISSION", "INVENTORY_RECEIVE"
    val payloadJson: String,
    val timestampUtc: Long = System.currentTimeMillis(),
    val retryCount: Int = 0,
    val isFailed: Boolean = false
)

@Dao
interface ShipmentDao {
    @Query("SELECT * FROM shipments ORDER BY createdAtUtc DESC")
    suspend fun getAllShipments(): List<ShipmentEntity>

    @Query("SELECT * FROM shipments WHERE trackingNumber = :trackingNumber OR barcode = :barcode LIMIT 1")
    suspend fun getByTracking(trackingNumber: String, barcode: String): ShipmentEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertShipments(shipments: List<ShipmentEntity>)

    @Update
    suspend fun updateShipment(shipment: ShipmentEntity)
}

@Dao
interface SyncQueueDao {
    @Query("SELECT * FROM sync_queue WHERE isFailed = 0 ORDER BY timestampUtc ASC")
    suspend fun getPendingOperations(): List<SyncQueueEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun enqueue(operation: SyncQueueEntity)

    @Delete
    suspend fun remove(operation: SyncQueueEntity)

    @Query("SELECT COUNT(*) FROM sync_queue")
    suspend fun getPendingCount(): Int
}

@Database(entities = [ShipmentEntity::class, SyncQueueEntity::class], version = 1, exportSchema = false)
abstract class AppDatabase : RoomDatabase() {
    abstract fun shipmentDao(): ShipmentDao
    abstract fun syncQueueDao(): SyncQueueDao
}
