import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { HelperService } from './services/helper/helper.service';
import { DominoesService } from './services/dominoes/dominoes.service';
import { TableValidatorService } from './services/table-validator/table-validator.service';
import { GeneratorService } from './services/generator/generator.service';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
  ],
  controllers: [AppController],
  providers: [
    HelperService,
    DominoesService,
    TableValidatorService,
    GeneratorService,
  ],
})
export class AppModule {}
