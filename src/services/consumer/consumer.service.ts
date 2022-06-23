import { OnQueueCompleted, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import logger from '../../utils/logger';
import { AppGateway } from '../../gateways/app.gateway';

@Processor('solve')
export class ConsumerService {
  constructor(private readonly gateway: AppGateway) {}

  @OnQueueCompleted()
  onCompleted(job: Job, result: string[][]): void {
    logger.debug('Job is completed');
    this.gateway.sendResult(result);
  }
}
