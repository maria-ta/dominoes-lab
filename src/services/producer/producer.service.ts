import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { logMethodInfo } from '../../decorators/log-method-info.decorator';
import logger from '../../utils/logger';
import { InitialTableDto } from '../../dto/initial-table.dto';

@Injectable()
export class ProducerService {
  constructor(@InjectQueue('solve') private solveQueue: Queue) {}

  @logMethodInfo
  async solve(initialTableDto: InitialTableDto): Promise<void> {
    logger.debug('Add job to queue');
    await this.solveQueue.add(initialTableDto);
  }
}
