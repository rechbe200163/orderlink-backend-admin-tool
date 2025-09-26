// src/rbac/permission.maps.ts
import { Actions, Resources } from '@prisma/client';

export function adminPermissions(): Array<{
  action: Actions;
  resource: Resources;
}> {
  const actions = Object.values(Actions);
  const resources = Object.values(Resources);
  const all: Array<{ action: Actions; resource: Resources }> = [];

  for (const r of resources) {
    if (r === Resources.STATISTICS) {
      all.push({ resource: r, action: Actions.READ });
      continue;
    }
    for (const a of actions) all.push({ resource: r, action: a });
  }
  return all;
}

export function supplierPermissions(): Array<{
  action: Actions;
  resource: Resources;
}> {
  const viewables = [
    Resources.PRODUCT,
    Resources.ORDER,
    Resources.CUSTOMER,
    Resources.ADDRESS,
    Resources.INVOICE,
    Resources.ROUTES,
    Resources.ORDER,
    Resources.SITE_CONFIG,
  ];
  const out: Array<{ action: Actions; resource: Resources }> = [];
  for (const r of viewables) out.push({ resource: r, action: Actions.READ });

  // write/update Orders
  out.push({ resource: Resources.ORDER, action: Actions.CREATE });
  out.push({ resource: Resources.ORDER, action: Actions.UPDATE });

  return out;
}

export function employeePermissions(): Array<{
  action: Actions;
  resource: Resources;
}> {
  const excludedRead = new Set<Resources>([
    Resources.ACTION,
    Resources.PERMISSION,
    Resources.STATISTICS,
    Resources.OTP,
  ]);

  const out: Array<{ action: Actions; resource: Resources }> = [];
  for (const r of Object.values(Resources)) {
    if (!excludedRead.has(r)) out.push({ resource: r, action: Actions.READ });
  }

  // create-only for these
  const creatables = [
    Resources.CUSTOMER,
    Resources.PRODUCT,
    Resources.ORDER,
    Resources.ADDRESS,
  ];
  for (const r of creatables) out.push({ resource: r, action: Actions.CREATE });

  return out;
}
