import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AppController } from './app.controller';
import { HelperService } from './services/helper/helper.service';
import { DominoesService } from './services/dominoes/dominoes.service';
import { TableValidatorService } from './services/table-validator/table-validator.service';
import { GeneratorService } from './services/generator/generator.service';
import { BullModule } from '@nestjs/bull';
import { ProducerService } from './services/producer/producer.service';
import { ConsumerService } from './services/consumer/consumer.service';
import { AppGateway } from './gateways/app.gateway';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    BullModule.forRoot({
      redis: {
        host: 'localhost',
        port: 6379,
      },
    }),
    BullModule.registerQueue({
      name: 'solve',
      processors: [join(__dirname, 'processors/dominoes.processor.js')],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppGateway,
    HelperService,
    DominoesService,
    TableValidatorService,
    GeneratorService,
    ProducerService,
    ConsumerService,
  ],
})
export class AppModule {}
