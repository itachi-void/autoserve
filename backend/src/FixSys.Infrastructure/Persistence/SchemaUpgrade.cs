using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.EntityFrameworkCore.Storage;

namespace FixSys.Infrastructure.Persistence;

public static class SchemaUpgrade
{
    public static async Task ApplyAsync(IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        if (!await db.Database.CanConnectAsync()) return;
        var connection = db.Database.GetDbConnection();
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT to_regclass('\"Branches\"') IS NOT NULL";
        if (await command.ExecuteScalarAsync() is not true) return;
        await using var transaction = await db.Database.BeginTransactionAsync();
        await db.Database.ExecuteSqlRawAsync("SELECT pg_advisory_xact_lock(19261006)");
        await db.Database.ExecuteSqlRawAsync("""
            ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "IsTrial" boolean NOT NULL DEFAULT false;
            ALTER TABLE "Users" ADD COLUMN IF NOT EXISTS "SecurityStamp" uuid NOT NULL DEFAULT gen_random_uuid();
            ALTER TABLE "Branches" ADD COLUMN IF NOT EXISTS "TrialExpiresAt" timestamp with time zone;
            ALTER TABLE "WorkOrders" ADD COLUMN IF NOT EXISTS "StockReserved" boolean NOT NULL DEFAULT false;
            ALTER TABLE "WorkOrders" ADD COLUMN IF NOT EXISTS "StockConsumed" boolean NOT NULL DEFAULT false;
            ALTER TABLE "WorkOrderLines" ADD COLUMN IF NOT EXISTS "SparePartId" uuid;
            ALTER TABLE "InvoicePayments" ADD COLUMN IF NOT EXISTS "RequestId" uuid;
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_InvoicePayments_RequestId" ON "InvoicePayments" ("RequestId") WHERE "RequestId" IS NOT NULL;
            UPDATE "WorkOrders" SET "StockConsumed" = true WHERE "Status" IN ('Completed', 'Delivered') AND NOT "StockConsumed" AND NOT "StockReserved";
            CREATE TABLE IF NOT EXISTS "AuditEntries" (
                "Id" uuid PRIMARY KEY, "CreatedAt" timestamp with time zone NOT NULL, "UpdatedAt" timestamp with time zone,
                "BranchId" uuid NOT NULL, "ActorId" uuid, "EntityType" text NOT NULL, "RecordId" uuid NOT NULL, "Action" text NOT NULL
            );
            CREATE INDEX IF NOT EXISTS "IX_AuditEntries_BranchId_CreatedAt" ON "AuditEntries" ("BranchId", "CreatedAt");
            """);
        foreach (var table in new[] { "Roles", "SpareParts", "Suppliers", "ServiceCategories", "Services", "InspectionTemplates" })
        {
            command.Transaction = transaction.GetDbTransaction();
            command.CommandText = $$"""
                DO $upgrade$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '{{table}}' AND column_name = 'BranchId') THEN
                        IF (SELECT count(*) FROM "Branches") <> 1 THEN
                            RAISE EXCEPTION 'Legacy catalogs require an explicit branch mapping before upgrading a multi-branch database';
                        END IF;
                        ALTER TABLE "{{table}}" ADD COLUMN "BranchId" uuid;
                        UPDATE "{{table}}" SET "BranchId" = (SELECT "Id" FROM "Branches" LIMIT 1);
                        ALTER TABLE "{{table}}" ALTER COLUMN "BranchId" SET NOT NULL;
                    END IF;
                END $upgrade$;
                """;
            await command.ExecuteNonQueryAsync();
        }
        await db.Database.ExecuteSqlRawAsync("""
            DROP INDEX IF EXISTS "IX_Roles_Key";
            DROP INDEX IF EXISTS "IX_SpareParts_Sku";
            DROP INDEX IF EXISTS "IX_Suppliers_Code";
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Roles_BranchId_Key" ON "Roles" ("BranchId", "Key");
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_SpareParts_BranchId_Sku" ON "SpareParts" ("BranchId", "Sku");
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Suppliers_BranchId_Code" ON "Suppliers" ("BranchId", "Code");
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_WorkOrders_EstimateId" ON "WorkOrders" ("EstimateId") WHERE "EstimateId" IS NOT NULL;
            CREATE UNIQUE INDEX IF NOT EXISTS "IX_Invoices_WorkOrderId" ON "Invoices" ("WorkOrderId") WHERE "WorkOrderId" IS NOT NULL AND "Status" <> 'Cancelled';
            """);
        await transaction.CommitAsync();
    }
}
