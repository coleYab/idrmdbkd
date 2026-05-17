# ERT Team Status & Deployment Location Tracking

## Overview

The **Emergency Response Team (ERT) Module** implements GIS-based tracking and visualization of ERT unit deployment locations and operational status. This enables command center personnel to monitor unit positions on an operational map in real-time.

## Features

### 1. **Unit Deployment Locations (GeoJSON Points)**
- Each ERT unit has a geographic location stored as a PostGIS Point (EPSG:4326)
- Supports spatial queries for distance-based filtering
- Locations are visualized on operational maps

### 2. **Unit Status Tracking**
- **IDLE** - Unit not deployed
- **DEPLOYED** - Unit actively engaged in operations
- **MAINTENANCE** - Unit undergoing maintenance

### 3. **Regional Assignment**
- Units are tagged with deployment regions (e.g., "Oromia Region", "Addis Ababa")
- Query units by region for operational planning

### 4. **Spatial Analytics**
- Find nearby units within a radius (in meters or kilometers)
- Automatic distance ordering (nearest first)
- Used for resource allocation and coordination

## Database Schema

```sql
CREATE TABLE ert_units (
  unitID uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name varchar(255) NOT NULL,
  status varchar(50) DEFAULT 'idle',
  region varchar(255),
  location geometry(Point, 4326),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ert_units_location ON ert_units USING GIST(location);
```

## API Endpoints

### Create ERT Unit
```http
POST /ert
Content-Type: application/json

{
  "name": "Alpha Unit",
  "region": "Oromia Region",
  "latitude": 9.0320,
  "longitude": 38.7469
}
```

**Response:**
```json
{
  "data": {
    "unitID": "uuid-here",
    "name": "Alpha Unit",
    "status": "idle",
    "region": "Oromia Region",
    "location": {
      "type": "Point",
      "coordinates": [38.7469, 9.0320]
    },
    "createdAt": "2025-05-17T10:00:00Z",
    "updatedAt": "2025-05-17T10:00:00Z"
  },
  "meta": {}
}
```

### List All ERT Units
```http
GET /ert
```

### Filter Units by Region
```http
GET /ert?region=Oromia%20Region
```

### Get ERT Unit by ID
```http
GET /ert/{id}
```

### Update Unit Location
```http
PATCH /ert/{id}/location
Content-Type: application/json

{
  "latitude": 9.1234,
  "longitude": 38.8901
}
```

### Update Unit Status
```http
PATCH /ert/{id}/status
Content-Type: application/json

{
  "status": "deployed"
}
```

### Get Nearby Units (Map Visualization)
```http
GET /ert/map
GET /ert/map?lat=9.0320&lon=38.7469&radiusKm=50
```

Returns all units within specified radius (default: 50km), ordered by distance.

**Response:**
```json
{
  "data": [
    {
      "unitID": "unit-1",
      "name": "Alpha Unit",
      "status": "deployed",
      "region": "Oromia Region",
      "location": { "type": "Point", "coordinates": [38.7469, 9.0320] },
      "distance": 0
    },
    {
      "unitID": "unit-2",
      "name": "Bravo Unit",
      "status": "idle",
      "region": "Addis Ababa",
      "location": { "type": "Point", "coordinates": [38.7469, 9.0320] },
      "distance": 15234
    }
  ],
  "meta": {}
}
```

### Delete ERT Unit
```http
DELETE /ert/{id}
```

## File Structure

```
src/ert/
├── domain/
│   ├── entities/
│   │   └── ert-unit.entity.ts          # Domain entity with status enum
│   └── repositories/
│       └── ert-unit.repository.ts      # Repository interface
├── infrastructure/
│   └── persistence/
│       ├── repositories/
│       │   └── ert-unit-typeorm.repository.ts
│       └── typeorm/
│           └── ert-unit-typeorm.entity.ts  # TypeORM entity with PostGIS
├── application/
│   └── services/
│       └── ert.service.ts              # Business logic
├── interfaces/
│   └── http/
│       └── controllers/
│           └── ert.controller.ts       # HTTP endpoints
└── ert.module.ts                        # Module registration
```

## Prerequisites

### Database Setup

1. **Enable PostGIS Extension** (required for spatial queries):
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```

2. **Run migration**:
   ```bash
   npm run migration:run
   ```

### Environment Variables

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=disaster_response_db
DB_USER=postgres
DB_PASS=password
```

## Usage Examples

### Docker Compose (includes Postgres + PostGIS)
```bash
docker-compose up -d
npm run migration:run
npm run start:dev
```

### Test API
```bash
node test-ert-api.js
```

## Implementation Details

### PostGIS Spatial Queries

The repository uses PostGIS functions for efficient spatial queries:

```typescript
// Find units within 50km of a center point (ordered by distance)
const units = await ertService.findNearby(latitude, longitude, 50000);
```

Underlying SQL:
```sql
SELECT * FROM ert_units
WHERE ST_DWithin(
  location::geography,
  ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography,
  radiusMeters
)
ORDER BY ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(lon, lat), 4326)::geography) ASC;
```

### GeoJSON Format

All locations are stored and returned in GeoJSON format:
```json
{
  "type": "Point",
  "coordinates": [longitude, latitude]
}
```

Note: coordinates are [longitude, latitude] per GeoJSON spec.

## Integration with Resources Module

The ERT module works alongside the **Resources Module** for:
- Allocating supplies to nearby units
- Route optimization for resource distribution
- Tracking inventory at unit locations

Example: Find all inventory items near an ERT unit's location:
```http
GET /resources/inventory?location=9.0320,38.7469,50000
```

## Future Enhancements

- [ ] Real-time location tracking via WebSockets
- [ ] Route optimization for multi-unit coordination
- [ ] Incident assignment to nearest units
- [ ] Movement history and replay
- [ ] Heat map visualization of deployment density
- [ ] Integration with mobile apps for on-field reporting

## Testing

Run the provided test script:
```bash
npm run build
npm run start:dev &
sleep 2
node test-ert-api.js
```

Expected output:
- ✅ Create units in different regions
- ✅ List units with regional filtering
- ✅ Query nearby units with distance calculations
- ✅ Update location and status in real-time
