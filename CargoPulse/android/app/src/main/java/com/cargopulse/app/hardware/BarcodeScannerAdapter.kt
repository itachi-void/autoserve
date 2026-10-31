package com.cargopulse.app.hardware

data class ScannerDevice(
    val name: String,
    val type: String, // "CAMERA", "BLUETOOTH_LASER", "INTERNAL_WEDGE"
    val isReady: Boolean = true
)

object BarcodeScannerAdapter {
    fun getAvailableScanners(): List<ScannerDevice> = listOf(
        ScannerDevice("Integrated Camera Scanner (CameraX)", "CAMERA", isReady = true),
        ScannerDevice("Honeywell Voyager 1602g BT", "BLUETOOTH_LASER", isReady = true),
        ScannerDevice("Zebra DataWedge Internal Scanner", "INTERNAL_WEDGE", isReady = true)
    )

    fun simulateBarcodeScan(barcode: String, onScanned: (String) -> Unit) {
        onScanned(barcode)
    }
}
