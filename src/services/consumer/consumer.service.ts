import { OnQueueActive, OnQueueCompleted, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { DominoesService } from '../dominoes/dominoes.service';
import logger from '../../utils/logger';
import { AppGateway } from '../../gateways/app.gateway';

@Processor('solve')
export class ConsumerService {
  constructor(
    private readonly dominoesService: DominoesService,
    private readonly getaway: AppGateway,
  ) {}

  @OnQueueCompleted()
  onCompleted(job: Job, result: string[][]): void {
    logger.debug('Job is completed');
    this.getaway.sendResult(result);
  }

  @OnQueueActive()
  onActive(job: Job) {
    console.log(
      `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
    );
  }
}
