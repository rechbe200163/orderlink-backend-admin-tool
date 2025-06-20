import { Transform } from 'class-transformer';

export const ToOptionalNumber = () =>
  Transform(({ value }) => {
    if (value === '' || value === null || value === undefined) return undefined;
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  });

export const ToOptionalString = () =>
  Transform(({ value }) => (value === '' ? undefined : value));

export const ToOptionalUUID = () =>
  Transform(({ value }) => (value === '' ? undefined : value));
