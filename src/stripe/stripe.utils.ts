export enum ModuleName {
  INSIGHT = 'INSIGHT', // Statistiken
  FLOW = 'FLOW', // Navigation
  ACCESS = 'ACCESS', // Custom Roles
}
export enum UserTier {
  CORE = 'CORE',
  TEAM = 'TEAM',
  PRO = 'PRO',
  ENTERPRISE = 'ENTERPRISE',
}

export const modulePrices: Record<ModuleName, number> = {
  // pro Module
  INSIGHT: 10, // Statistiken
  FLOW: 15, // Navigation
  ACCESS: 5, // Custom Roles
};

export const userPrices: Record<UserTier, number> = {
  CORE: 0, // bis 3 Nutzer
  TEAM: 5, // bis 5 Nutzer
  PRO: 10, // bis 7 Nutzer
  ENTERPRISE: 0, // wird separat verhandelt
};

export const setupFee = 49;

export function calculateOrderLinkPricing(
  modules?: ModuleName[],
  userTier?: UserTier
): {
  netMonthly: number;
  setupFee: number;
  vat: number;
  grossFirstMonth: number;
} {
  const moduleSum = (modules ?? []).reduce(
    (sum, mod) => sum + modulePrices[mod],
    0
  );
  const userFee = userTier ? userPrices[userTier] : 0;
  const netMonthly = moduleSum + userFee;
  const vat = +(netMonthly + setupFee) * 0.2;
  const gross = +(netMonthly + setupFee + vat);

  return {
    netMonthly,
    setupFee,
    vat: Math.round(vat * 100) / 100,
    grossFirstMonth: Math.round(gross * 100) / 100,
  };
}
