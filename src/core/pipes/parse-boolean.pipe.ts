import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';

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
        console.log("Typeof:---=========---", typeof value); 
        if (propertyType === Boolean) {
            console.log("Typeof:------", typeof value); 
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
 