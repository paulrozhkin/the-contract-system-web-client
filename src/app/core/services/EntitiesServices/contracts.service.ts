import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {Contract} from '../../models/contract.model';
import {Observable, of} from 'rxjs';
import {ContractCreate, ContractStatus, ContractUpdate, Rank, SearchResultPagination} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class ContractsService extends BaseEntityService<Contract> {
  protected search(): Observable<SearchResultPagination<Contract>> {
    return this.getAll('/contracts/');
  }

  public createContract(newContract: ContractCreate): Observable<Contract> {
    return this.apiService.post('/contracts/', newContract);
  }

  getById(id: number): Observable<Contract> {
    return this.apiService.get(`/contracts/${id}`);
  }

  updateContract(contractId: number, updateContract: ContractUpdate): Observable<Contract> {
    return this.apiService.put(`/contracts/${contractId}`, updateContract);
  }

  startPerform(contractId: number): Observable<Contract> {
    return this.apiService.post(`/contracts/${contractId}/perform/`);
  }

  performed(contractId: number, performedComment: string): Observable<Contract> {
    const body = {
      performedComment
    };

    return this.apiService.post(`/contracts/${contractId}/performed/`, body);
  }

  cancelPerform(contractId: number, cancellationComment: string): Observable<Contract> {
    const body = {
      cancellationComment
    };

    return this.apiService.post(`/contracts/${contractId}/cancel/`, body);
  }

}
