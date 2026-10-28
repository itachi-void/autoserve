namespace FixSys.Domain.Common;

public enum CustomerType { Individual, Company }
public enum ActiveStatus { Active, Inactive }
public enum EmployeeStatus { Active, OnLeave, Suspended, Terminated }
public enum TechnicianStatus { Available, Busy, OnBreak, Off }
public enum LedgerTransactionType { Invoice, Payment, Adjustment, Refund }
public enum StockTransactionType { In, Out, Adjustment, Return }
public enum PurchaseOrderStatus { Draft, Sent, PartiallyReceived, Received, Cancelled }
public enum PricingModel { Fixed, Hourly }
public enum TaskClockStatus { Running, Paused, Completed }
public enum AppointmentStatus { Scheduled, Confirmed, CheckedIn, Completed, Cancelled, NoShow }
public enum InspectionStatus { Draft, InProgress, Completed }
public enum EstimateStatus { Draft, Presented, Approved, PartiallyApproved, Rejected, Expired }
public enum LineKind { Service, Part }
public enum LineDecision { Pending, Accepted, Rejected }
public enum WorkOrderStatus { Pending, InProgress, WaitingParts, Completed, Delivered, Cancelled }
public enum WorkOrderPriority { Low, Normal, High, Urgent }
public enum SupplementStatus { Pending, Approved, Rejected }
public enum InvoiceStatus { Unpaid, PartiallyPaid, Paid, Cancelled }
public enum PaymentMethod { Cash, Card, BankTransfer, Cheque }
