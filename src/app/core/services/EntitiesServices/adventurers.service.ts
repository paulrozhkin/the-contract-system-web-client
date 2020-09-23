import {Injectable} from '@angular/core';
import {BaseEntityService} from './base-entity.service';
import {Adventurer, AdventurerStatus} from '../../models';
import {Observable} from 'rxjs';
import {SearchResultPagination} from '../../models';

@Injectable({
  providedIn: 'root'
})
export class AdventurersService extends BaseEntityService<Adventurer> {
  protected search(): Observable<SearchResultPagination<Adventurer>> {
    return this.getAll('/adventurers/');
  }

  public getById(id: number): Observable<Adventurer> {
    return this.apiService.get(`/adventurers/${id}`);
  }

  public updateAdventurerStatus(id: number, newStatus: AdventurerStatus) {
    const request = {
      status: newStatus
    };

    return this.apiService.put(`/adventurers/${id}`, request);
  }
}
