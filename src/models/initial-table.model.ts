import { InitialTableDto } from '../dto/initial-table.dto';

export class InitialTableModel extends InitialTableDto {
  onSolveCallback: (result: string[][]) => void;
}
