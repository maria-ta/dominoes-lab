import { HelperService } from '../services/helper/helper.service';
import { DominoesService } from '../services/dominoes/dominoes.service';
import { DoneCallback, Job } from 'bull';

const helperService = new HelperService();
const dominoesService = new DominoesService(helperService);

export default function (job: Job, cb: DoneCallback) {
  const initialTable = job.data.initialTable;
  const result = dominoesService.solveProblem(initialTable);
  cb(null, result);
}
