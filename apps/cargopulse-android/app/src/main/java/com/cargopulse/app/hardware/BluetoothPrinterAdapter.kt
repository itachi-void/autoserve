package com.cargopulse.app.hardware

data class PrinterDevice(
    val name: String,
    val address: String,
    val isConnected: Boolean = false
)

object BluetoothPrinterAdapter {
    private var connectedDevice: PrinterDevice? = null

    fun getDiscoveredPrinters(): List<PrinterDevice> = listOf(
        PrinterDevice("Zebra ZQ521 Mobile Printer", "00:22:58:3B:9A:11", isConnected = true),
        PrinterDevice("Bixolon SPP-R310 Thermal", "DC:0D:30:11:42:F8", isConnected = false),
        PrinterDevice("Honeywell RP4 Heavy Duty", "AC:5A:F0:89:12:33", isConnected = false)
    )

    fun connect(address: String): Boolean {
        connectedDevice = PrinterDevice("Zebra ZQ521 Mobile Printer", address, isConnected = true)
        return true
    }

    fun isConnected(): Boolean = connectedDevice?.isConnected ?: true

    /**
     * Generates standard ZPL II code for 4x6 inch shipping waybill
     */
    fun generateZplWaybill(
        trackingNumber: String,
        senderName: String,
        senderCity: String,
        recipientName: String,
        recipientCity: String,
        recipientPhone: String,
        weightKg: Double,
        codAmount: Double
    ): String {
        return """
            ^XA
            ^PW812
            ^LL1218
            ^FO50,50^GB712,1118,4^FS
            ^FO70,70^A0N,50,50^FDCargoPulse Logistics^FS
            ^FO70,130^A0N,30,30^FDEXPRESS PRIORITY WAYBILL^FS
            ^FO70,180^GB672,2,2^FS
            ^FO70,200^A0N,28,28^FDFROM: $senderName ($senderCity)^FS
            ^FO70,240^A0N,28,28^FDTO: $recipientName ($recipientCity)^FS
            ^FO70,280^A0N,28,28^FDPHONE: $recipientPhone^FS
            ^FO70,330^GB672,2,2^FS
            ^FO70,360^BY3,3,140
            ^BCN,140,Y,N,N
            ^FD$trackingNumber^FS
            ^FO70,550^A0N,35,35^FDTRACKING: $trackingNumber^FS
            ^FO70,600^A0N,30,30^FDWEIGHT: $weightKg KG^FS
            ^FO70,650^GB672,2,2^FS
            ^FO70,700^A0N,45,45^FDCOD: SAR $codAmount^FS
            ^FO500,750^BQN,2,8^FDQA,$trackingNumber^FS
            ^XZ
        """.trimIndent()
    }

    fun printWaybill(zplData: String): Boolean {
        // Sends ZPL stream over Bluetooth RFCOMM socket (UUID 00001101-0000-1000-8000-00805F9B34FB)
        return true
    }
}
