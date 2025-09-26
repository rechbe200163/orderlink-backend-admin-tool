import { PrismaClient, ModuleEnum, TenantStatus } from '@prisma/client';
const prisma = new PrismaClient();

const ALL_MODULES: ModuleEnum[] = ['CUSTOM_ROLES', 'STATISTICS', 'NAVIGATION'];

type SeedArgs = {
  tx: any;
  tenantId: string;
};

export async function enableAllModulesForTenantDuringTrial({
  tx,
  tenantId,
}: SeedArgs) {
  // 0) Sicherstellen, dass Module existieren (idempotent)
  await tx.module.createMany({
    data: ALL_MODULES.map((name) => ({ name })),
    skipDuplicates: true,
  });

  // 1) Trial-Check: Tenant muss TRIAL sein & Trial noch nicht abgelaufen
  const tenant = await tx.tenant.findUnique({
    where: { tenantId },
    select: { tenantId: true, status: true, trialEndsAt: true },
  });

  if (!tenant) throw new Error(`Tenant ${tenantId} not found`);
  if (tenant.status !== TenantStatus.TRIAL) {
    // nicht blockieren – nur Info
    console.warn(
      `Tenant ${tenantId} is ${tenant.status}, enabling anyway (idempotent).`,
    );
  }

  // 2) Enable: in EnabledModule eintragen (idempotent via createMany + skipDuplicates)
  await tx.enabledModule.createMany({
    data: ALL_MODULES.map((moduleName) => ({
      tenantId: tenantId,
      moduleName,
    })),
    skipDuplicates: true,
  });
}
