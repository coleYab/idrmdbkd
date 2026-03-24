export enum DisasterSeverityLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
  CRITICAL = 'Critical',
}

export enum DisasterStatus {
  PENDING = 'Pending',
  VERIFIED = 'Verified',
  ACTIVE = 'Active',
  RESOLVED = 'Resolved',
  REPEATED = 'Repeated',
  FALSE_ALARM = 'False Alarm',
  REJECTED = 'Rejected',
}

export enum DisasterType {
  FLOOD = 'Flood',
  DROUGHT = 'Drought',
  LANDSLIDE = 'Landslide',
  LOCUST = 'Locust',
  CONFLICT = 'Conflict',
  FIRE = 'Fire',
}
