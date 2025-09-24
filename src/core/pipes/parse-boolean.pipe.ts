//import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

/*@Injectable()
export class ParseBooleanPipe implements PipeTransform<string, boolean> {
  transform(value: string, metadata: ArgumentMetadata): boolean {

    console.log("Typeof:------", typeof value); 
    if (typeof value !== 'string') {
      throw new BadRequestException('Validation failed: Expected a string value for boolean conversion.');
    }
    const lowerCaseValue = value.toLowerCase();
    if (lowerCaseValue === 'true' || lowerCaseValue === '1') {
      return true;
    }
    if (lowerCaseValue === 'false' || lowerCaseValue === '0') {
      return false;
    }
    throw new BadRequestException(`Validation failed: Cannot convert "${value}" to a boolean.`);
  }
} */
 /*
@Injectable()
export class ParseBooleanPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata): boolean  {
    // Only act on body payloads that are objects
    console.log("Typeof:-===========-----", typeof value); 

    if (metadata.type === 'body' && typeof value === 'object' && value !== null) {
      for (const key in value) {
        console.log("Typeof:------", typeof value); 
        if (typeof value[key] === 'string') {
          const lower = value[key].trim().toLowerCase();
          if (lower === 'true' || lower === '1') value[key] = true;
          if (lower === 'false' || lower === '0') value[key] = false;
        }
      }
    }
    return value;
  }
} 
*/
 /*
//import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import 'reflect-metadata';

@Injectable()
export class ParseBooleanPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' &&
      typeof value === 'object' &&
      value !== null &&
      metadata.metatype &&
      metadata.metatype !== Object
    ) {
      // Loop over the DTO properties
      for (const key of Object.keys(value)) {
        const propertyType = Reflect.getMetadata('design:type', metadata.metatype.prototype, key);
       // console.log("Typeof:---=========---", typeof value); 
        if (propertyType === Boolean) {
         //   console.log("Typeof:------", typeof value); 
          if (typeof value[key] === 'string') {
            const lower = value[key].trim().toLowerCase();
            if (lower === 'true' || lower === '1') {
              value[key] = true;
            } else if (lower === 'false' || lower === '0') {
              value[key] = false;
            }
          }
        }
      }
    }

    return value;
  }
}
 */
import { Injectable, PipeTransform, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import 'reflect-metadata';

@Injectable()
export class ParsePrimitivesPipe implements PipeTransform {
   transform(value: any, metadata: ArgumentMetadata) {
    // ✅ FIX: Add proper checks for empty bodies and invalid metadata
    if (
      metadata.type === 'body' &&
      typeof value === 'object' &&
      value !== null &&
      Object.keys(value).length > 0 && // ✅ Check if body is not empty
      metadata.metatype &&
      metadata.metatype !== Object &&
      metadata.metatype.prototype // ✅ Ensure prototype exists
    ) {
      try {
        this.convertPrimitives(value, metadata.metatype);
      } catch (error) {
        throw new BadRequestException(`Data transformation failed: ${error.message}`);
      }
    }
    return value;
  }

  private convertPrimitives(obj: any, metatype: any) {
    if (!obj || typeof obj !== 'object') return;

    const keys = Object.keys(obj);

    for (const key of keys) {
      try {
        const propertyType = Reflect.getMetadata('design:type', metatype.prototype, key);
        if (!propertyType) continue;

        // ✅ Boolean conversion
        if (propertyType === Boolean) {
          obj[key] = this.convertToBoolean(obj[key]);
        }
        // ✅ Number conversion
        else if (propertyType === Number) {
          obj[key] = this.convertToNumber(obj[key]);
        }
        // ✅ String conversion (trimming)
        else if (propertyType === String && typeof obj[key] === 'string') {
          obj[key] = obj[key].trim();
        }
        // ✅ Date conversion
        else if (propertyType === Date) {
          obj[key] = this.convertToDate(obj[key]);
        }
        // ✅ Nested object
        else if (
          typeof obj[key] === 'object' &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          propertyType !== Object
        ) {
          this.convertPrimitives(obj[key], propertyType);
        }
        // ✅ Array of nested DTOs or primitive values
        else if (Array.isArray(obj[key])) {
          this.convertArray(obj[key], metatype.prototype, key);
        }
      } catch (error) {
        // Continue processing other fields but log the error
        console.warn(`Failed to convert field ${key}:`, error.message);
      }
    }
  }

  private convertArray(array: any[], target: any, propertyKey: string) {
    const arrayItemType = this.getArrayItemType(target, propertyKey);
    
    for (let i = 0; i < array.length; i++) {
      try {
        if (arrayItemType === Boolean) {
          array[i] = this.convertToBoolean(array[i]);
        } else if (arrayItemType === Number) {
          array[i] = this.convertToNumber(array[i]);
        } else if (arrayItemType === String && typeof array[i] === 'string') {
          array[i] = array[i].trim();
        } else if (arrayItemType === Date) {
          array[i] = this.convertToDate(array[i]);
        } else if (typeof array[i] === 'object' && array[i] !== null) {
          this.convertPrimitives(array[i], arrayItemType);
        }
      } catch (error) {
        console.warn(`Failed to convert array item at index ${i}:`, error.message);
      }
    }
  }

  private convertToBoolean(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      const lower = value.trim().toLowerCase();
      if (lower === 'true' || lower === '1' || lower === 'yes' || lower === 'on') return true;
      if (lower === 'false' || lower === '0' || lower === 'no' || lower === 'off') return false;
    }
    if (typeof value === 'number') {
      return value !== 0;
    }
    return Boolean(value);
  }

  private convertToNumber(value: any): number {
    if (value === null || value === undefined) return value;
    if (typeof value === 'number') return value;
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value);
      if (isNaN(parsed)) {
        throw new Error(`Cannot convert '${value}' to number`);
      }
      return parsed;
    }
    return value;
  }

  private convertToDate(value: any): Date {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      if (isNaN(date.getTime())) {
        throw new Error(`Invalid date: ${value}`);
      }
      return date;
    }
    return value;
  }

  private getArrayItemType(target: any, propertyKey: string): any {
    return Reflect.getMetadata('design:ArrayItemType', target, propertyKey);
  }
}
/* this working class
import { Injectable, PipeTransform, ArgumentMetadata } from '@nestjs/common';
import 'reflect-metadata';

@Injectable()
export class ParsePrimitivesPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    if (
      metadata.type === 'body' &&
      typeof value === 'object' &&
      value !== null &&
      metadata.metatype &&
      metadata.metatype !== Object
    ) {
      this.convertPrimitives(value, metadata.metatype);
    }
    return value;
  }

  private convertPrimitives(obj: any, metatype: any) {
    const keys = Object.keys(obj);

    for (const key of keys) {
      const propertyType = Reflect.getMetadata('design:type', metatype.prototype, key);
      if (!propertyType) continue;

      // ✅ Boolean conversion
      if (propertyType === Boolean) {
        if (typeof obj[key] === 'string') {
          const lower = obj[key].trim().toLowerCase();
          if (lower === 'true' || lower === '1') obj[key] = true;
          else if (lower === 'false' || lower === '0') obj[key] = false;
        }
      }

      // ✅ Number conversion
      else if (propertyType === Number) {
        if (typeof obj[key] === 'string' && obj[key].trim() !== '') {
          const parsed = Number(obj[key]);
          if (!isNaN(parsed)) {
            obj[key] = parsed;
          }
        }
      }

      // ✅ Nested object
      else if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        propertyType !== Array &&
        propertyType !== Object
      ) {
        this.convertPrimitives(obj[key], propertyType);
      }

      // ✅ Array of nested DTOs or primitive values
      else if (Array.isArray(obj[key]) && propertyType === Array) {
        const arrayItemType = this.getArrayItemType(metatype.prototype, key);

        for (let i = 0; i < obj[key].length; i++) {
          if (arrayItemType) {
            if (arrayItemType === Boolean && typeof obj[key][i] === 'string') {
              const lower = obj[key][i].trim().toLowerCase();
              if (lower === 'true' || lower === '1') obj[key][i] = true;
              else if (lower === 'false' || lower === '0') obj[key][i] = false;
            } else if (arrayItemType === Number && typeof obj[key][i] === 'string') {
              const parsed = Number(obj[key][i]);
              if (!isNaN(parsed)) obj[key][i] = parsed;
            } else if (typeof obj[key][i] === 'object' && obj[key][i] !== null) {
              this.convertPrimitives(obj[key][i], arrayItemType);
            }
          }
        }
      }
    }
  }

  private getArrayItemType(target: any, propertyKey: string): any {
    return Reflect.getMetadata('design:ArrayItemType', target, propertyKey);
  }
}
*/

/************
 * 
 * 

Decorator to store array item type

export function ArrayItemType(type: any) {
  return (target: any, propertyKey: string) => {
    Reflect.defineMetadata('design:ArrayItemType', type, target, propertyKey);
  };
}

Example of the DTO

import { IsBoolean, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

class NestedDto {
  @IsBoolean()
  isActive: boolean;

  @IsNumber()
  quantity: number;
}

export class MainDto {
  @IsBoolean()
  status: boolean;

  @IsNumber()
  price: number;

  @ValidateNested({ each: true })
  @Type(() => NestedDto)
  @ArrayItemType(NestedDto)
  items: NestedDto[];
}


Example request (multipart form-data or JSON):

{
  "status": "false",
  "price": "1500",
  "items": [
    { "isActive": "true", "quantity": "10" },
    { "isActive": "0", "quantity": "5" }
  ]
}


Before ValidationPipe runs, it will be transformed to:

{
  status: false,
  price: 1500,
  items: [
    { isActive: true, quantity: 10 },
    { isActive: false, quantity: 5 }
  ]
}







 */