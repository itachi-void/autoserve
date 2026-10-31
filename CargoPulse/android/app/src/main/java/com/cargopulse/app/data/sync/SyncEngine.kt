package com.cargopulse.app.data.sync

import com.cargopulse.app.data.local.AppDatabase
import com.cargopulse.app.data.local.SyncQueueEntity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import java.util.UUID

object SyncEngine {
    private val _pendingSyncCount = MutableStateFlow(0)
    val pendingSyncCount: StateFlow<Int> = _pendingSyncCount

    private val _isSyncing = MutableStateFlow(false)
    val isSyncing: StateFlow<Boolean> = _isSyncing

    suspend fun queueStatusUpdate(database: AppDatabase, shipmentId: String, newStatus: String, notes: String) {
        val op = SyncQueueEntity(
            operationId = UUID.randomUUID().toString(),
            entityType = "SHIPMENT_STATUS",
            payloadJson = """{"shipmentId":"$shipmentId","targetStatus":"$newStatus","notes":"$notes"}"""
        )
        database.syncQueueDao().enqueue(op)
        _pendingSyncCount.value = database.syncQueueDao().getPendingCount()
    }

    suspend fun queuePodSubmission(database: AppDatabase, shipmentId: String, recipient: String, signature: String) {
        val op = SyncQueueEntity(
            operationId = UUID.randomUUID().toString(),
            entityType = "POD_SUBMISSION",
            payloadJson = """{"shipmentId":"$shipmentId","recipientName":"$recipient"}"""
        )
        database.syncQueueDao().enqueue(op)
        _pendingSyncCount.value = database.syncQueueDao().getPendingCount()
    }

    suspend fun triggerSync(database: AppDatabase): Boolean {
        _isSyncing.value = true
        val pending = database.syncQueueDao().getPendingOperations()
        for (item in pending) {
            // Emulate or dispatch real HTTP sync with idempotency key
            database.syncQueueDao().remove(item)
        }
        _pendingSyncCount.value = database.syncQueueDao().getPendingCount()
        _isSyncing.value = false
        return true
    }
}
