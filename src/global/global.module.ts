import { Module } from '@nestjs/common';
 

@Module({
  providers: [
    {
      provide: 'GLOBAL_VAR',
      useValue: 'Global value by jay',
    },
  ],
  exports: ['GLOBAL_VAR'],
 
})
export class GlobalModule {}
