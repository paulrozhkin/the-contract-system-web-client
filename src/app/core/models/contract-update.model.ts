import {Rank} from './ranks';
import {ContractStatus} from './contract-status';

export interface ContractUpdate {
  customer: number;
  executor: number;
  nameContract: string;
  reward: number;
  minRank: Rank;
  address: string;
  createTime: string;
  contractStatus: ContractStatus;
  description: string;
  requestComment: string;
  registrarComment: string;
  closedComment: string;
}
