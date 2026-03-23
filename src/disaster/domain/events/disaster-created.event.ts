import { Disaster } from '../entities/disaster.entity';

export class DisasterCreatedEvent {
  constructor(public readonly incident: Disaster) {}
}
