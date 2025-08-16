import { Transform } from 'class-transformer';
import { IsBoolean } from 'class-validator';

export function IsBooleanTransform() {
  return function (target: any, propertyKey: string) {
    Transform(({ value }) => {
      if (typeof value === 'boolean') return value;

      if (typeof value === 'string') {
        const lower = value.trim().toLowerCase();
        if (lower === 'true' || lower === '1') return true;
        if (lower === 'false' || lower === '0') return false;
      }

      return value; // Let class-validator throw error if invalid
    })(target, propertyKey);

    IsBoolean()(target, propertyKey);
  };
}
