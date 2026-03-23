import { Disaster } from '../entities/disaster.entity';

export class DisasterUpdatedEvent {
  constructor(public readonly incident: Disaster) {}
}
