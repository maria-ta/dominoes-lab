import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { HelperService } from './services/helper/helper.service';
import { DominoesService } from './services/dominoes/dominoes.service';
import { TableValidatorService } from './services/table-validator/table-validator.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [HelperService, DominoesService, TableValidatorService],
})
export class AppModule {}
