import {
  Body,
  Controller,
  Get,
  Post,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { DominoesService } from './services/dominoes/dominoes.service';
import { DefaultFilter } from './filters/default.filter';
import { ErrorHandlingInterceptor } from './interceptors/error-handling.interceptor';
import { TableValidatorService } from './services/table-validator/table-validator.service';

@Controller()
@UseInterceptors(ErrorHandlingInterceptor)
@UseFilters(new DefaultFilter())
export class AppController {
  constructor(
    private readonly dominoesService: DominoesService,
    private readonly tableValidatorService: TableValidatorService,
  ) {}

  @Get('health')
  health(): boolean {
    return true;
  }

  @Post('solve')
  solve(@Body() initialTable: number[][]): string[][] {
    this.tableValidatorService.checkTable(initialTable);
    return this.dominoesService.solveProblem(initialTable);
  }
}
