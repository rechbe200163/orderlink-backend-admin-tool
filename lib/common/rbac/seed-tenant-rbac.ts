// src/rbac/seed-tenant-rbac.ts
import { PrismaClient, Prisma } from '@prisma/client';
import {
  adminPermissions,
  supplierPermissions,
  employeePermissions,
} from './permission.maps';

type SeedArgs = {
  tx: any;
  tenantId: string;
};

export async function seedTenantRBAC({ tx, tenantId }: SeedArgs) {
  // 0) Ensure global RBAC tables

  // 1) Roles (composite PK: (tenantId, name))
  await tx.role.createMany({
    data: [
      { tenantId, name: 'ADMIN' },
      { tenantId, name: 'SUPPLIER' },
      { tenantId, name: 'EMPLOYEE' },
    ],
    skipDuplicates: true,
  });

  // 2) Build unique allowed permissions
  const rows: {
    tenantId: string;
    roleName: string;
    action: any;
    resource: any;
    allowed: boolean;
  }[] = [];
  const add = (
    roleName: string,
    list: Array<{ action: any; resource: any }>,
  ) => {
    console.log(`Adding permissions for role ${roleName}:`, list);
    for (const p of list)
      rows.push({
        tenantId,
        roleName,
        action: p.action,
        resource: p.resource,
        allowed: true,
      });
  };
  add('ADMIN', adminPermissions());
  add('SUPPLIER', supplierPermissions());
  add('EMPLOYEE', employeePermissions());

  // Deduplicate (roleName, action, resource)
  const key = (r: (typeof rows)[number]) =>
    `${r.roleName}:${r.resource}:${r.action}`;
  const uniq = Array.from(new Map(rows.map((r) => [key(r), r])).values());

  // 3) Insert allowed permissions (references ResourceAction via (action, resource))
  await tx.permission.createMany({
    data: uniq,
    skipDuplicates: true,
  });
  console.log(`Seeded RBAC for tenant ${tenantId}`);
}
