import { Incident } from '../entities/incident.entity';

export class IncidentCreatedEvent {
  constructor(public readonly incident: Incident) {}
}
