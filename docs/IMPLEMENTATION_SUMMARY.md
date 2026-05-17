# 📍 Resource Tracking & Logistics Mapping Implementation

## Overview

A complete **GIS-based Emergency Response System** has been implemented with two complementary modules:
1. **Resources Module** - Track and allocate supplies at geographic locations
2. **ERT (Emergency Response Team) Module** - Track unit deployment locations and operational status

Both modules use **PostGIS** spatial queries for distance-based filtering on an operational map.

---

## Module 1: Resources & Inventory Tracking

### Database Schema
```sql
-- Inventory items with PostGIS Point location
CREATE TABLE inventory_items (
  itemID uuid PRIMARY KEY,
  resourceID uuid,
  quantity int,
  location geometry(Point, 4326),  -- GeoJSON Point
  lastRestocked timestamp,
  createdAt timestamp,
  updatedAt timestamp
);

-- Resource needs with GIS-based allocation
CREATE TABLE resource_needs (
  needID uuid PRIMARY KEY,
  resourceID uuid,
  quantityRequired int,
  fulfilledQuantity int,
  priority enum ('low', 'medium', 'high'),
  status enum ('pending', 'in_progress', 'satisfied'),
  incidentID uuid,
  createdAt timestamp,
  updatedAt timestamp
);
```

### File Structure
```
src/resources/
├── domain/
│   ├── entities/
│   │   ├── inventory-items.entity.ts
│   │   ├── resource.entity.ts
│   │   └── resource-need.entity.ts
│   └── repositories/
│       ├── inventory-items.repository.ts
│       ├── resource.repository.ts
│       └── resource-need.repository.ts
├── infrastructure/
│   └── persistence/
│       ├── repositories/
│       │   ├── inventory-items-typeorm.repository.ts
│       │   ├── resource-typeorm.repository.ts
│       │   └── resource-need-typeorm.repository.ts
│       └── typeorm/
│           ├── inventory-items-typeorm.entity.ts
│           ├── resource-typeorm.entity.ts
│           └── resource-need-typeorm.entity.ts
├── application/
│   ├── services/
│   │   ├── inventory-items.service.ts
│   │   ├── resource.service.ts
│   │   └── resource-need.service.ts
│   └── dtos/
│       ├── create-inventory-item.dto.ts
│       ├── update-inventory-item.dto.ts
│       ├── create-resource.dto.ts
│       └── create-resource-need.dto.ts
└── interfaces/
    └── http/
        └── controllers/
            ├── inventory.controller.ts
            ├── resource.controller.ts
            └── resource-need.controller.ts
```

### Key Features

#### 1️⃣ Inventory Tracking with Coordinates
```http
POST /resources/inventory
{
  "resourceID": "uuid",
  "quantity": 100,
  "location": {
    "latitude": 9.0320,
    "longitude": 38.7469
  }
}
```

#### 2️⃣ Location-Based Queries
```http
GET /resources/inventory?location=9.0320,38.7469,50000
```
Returns items within 50km, ordered by distance.

#### 3️⃣ Needs-Based Allocation Routing
```http
POST /resources/needs/{needID}/allocate
{
  "latitude": 9.0320,
  "longitude": 38.7469,
  "radiusKm": 50
}
```
Response includes:
- Nearby inventory items (sorted by distance)
- Allocation plan (which items to use)
- Remaining unfulfilled quantity

#### 4️⃣ Map Resources Dashboard
```http
GET /resources/map?lat=9.0320&lon=38.7469&radiusKm=50
```
Returns combined view of:
- All inventory stockpiles near the center point
- All resource needs (prioritized)

### Spatial Queries

Uses PostGIS `ST_DWithin` and `ST_Distance`:
```sql
SELECT *, ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(lon,lat), 4326)::geography) as distance
FROM inventory_items
WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(lon,lat), 4326)::geography, radiusMeters)
ORDER BY distance ASC
```

---

## Module 2: Emergency Response Team (ERT) Tracking

### Database Schema
```sql
CREATE TABLE ert_units (
  unitID uuid PRIMARY KEY,
  name varchar(255),
  status enum ('idle', 'deployed', 'maintenance'),
  region varchar(255),
  location geometry(Point, 4326),
  createdAt timestamp,
  updatedAt timestamp
);

CREATE INDEX idx_ert_units_location ON ert_units USING GIST(location);
```

### File Structure
```
src/ert/
├── domain/
│   ├── entities/
│   │   └── ert-unit.entity.ts
│   └── repositories/
│       └── ert-unit.repository.ts
├── infrastructure/
│   └── persistence/
│       ├── repositories/
│       │   └── ert-unit-typeorm.repository.ts
│       └── typeorm/
│           └── ert-unit-typeorm.entity.ts
├── application/
│   └── services/
│       └── ert.service.ts
├── interfaces/
│   └── http/
│       └── controllers/
│           └── ert.controller.ts
└── ert.module.ts
```

### Key Features

#### 1️⃣ Create Unit with Deployment Location
```http
POST /ert
{
  "name": "Alpha Unit",
  "region": "Oromia Region",
  "latitude": 9.0320,
  "longitude": 38.7469
}
```

#### 2️⃣ Real-Time Status Updates
```http
PATCH /ert/{unitID}/status
{
  "status": "deployed"
}

PATCH /ert/{unitID}/location
{
  "latitude": 9.1234,
  "longitude": 38.8901
}
```

#### 3️⃣ Query Nearby Units (Command Center Map)
```http
GET /ert/map
GET /ert/map?lat=9.0320&lon=38.7469&radiusKm=50
```
Returns all units within radius, sorted by distance.

#### 4️⃣ Regional Filtering
```http
GET /ert?region=Oromia%20Region
```

### Operational Map

The command center can visualize:
- All deployed units on map
- Unit status (idle/deployed/maintenance)
- Distance from command center
- Assigned regions (Woredas/districts)

---

## Integration Points

### Resource Allocation to ERT Units

1. **Find nearest inventory to a resource need** at affected Woreda:
```
GET /resources/needs/{needID}/allocate?lat=lat&lon=lon&radiusKm=50
```

2. **Find nearby ERT units** at incident location:
```
GET /ert/map?lat=lat&lon=lon&radiusKm=50
```

3. **Assign resources to units**:
```
PATCH /resources/needs/{needID}/allocate
```

### Example Workflow

```
1. Disaster occurs in Woredas A & B (coordinates: 9.0320, 38.7469)
   ↓
2. Resource needs created:
   POST /resources/needs
   { resourceID: med-kits, quantityRequired: 500, priority: high }
   ↓
3. Find nearby inventory:
   POST /resources/needs/needID/allocate
   { latitude: 9.0320, longitude: 38.7469, radiusKm: 100 }
   → Returns: [Med kit depot at 15km, Supply center at 32km, ...]
   ↓
4. Find nearby ERT units to coordinate delivery:
   GET /ert/map?lat=9.0320&lon=38.7469&radiusKm=100
   → Returns: [Alpha Unit at 20km, Bravo Unit at 45km, ...]
   ↓
5. Assign Alpha Unit to coordinates:
   PATCH /ert/alpha-unit-id/location
   { latitude: 9.05, longitude: 38.75 }
   ↓
6. Monitor allocation progress:
   GET /resources/needs/needID/fulfillment
   { fulfilled: 250, required: 500, percentage: 50 }
```

---

## Database Setup

### Required Extensions
```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

### Deploy with Docker

```bash
# Use PostGIS-enabled Postgres
docker-compose up -d pgsqldb

# Run migrations (enables PostGIS, creates tables)
npm run migration:run

# Start dev server
npm run start:dev
```

### Environment Variables
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=disaster_response_db
DB_USER=postgres
DB_PASS=postgres
```

---

## API Endpoints Summary

### Resources Module
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/resources/inventory` | Add inventory at location |
| GET | `/resources/inventory?location=lat,lon,radiusM` | Find nearby inventory |
| POST | `/resources/needs` | Create resource need |
| GET | `/resources/needs/{id}/fulfillment` | Track allocation progress |
| POST | `/resources/needs/{id}/allocate` | GIS-based allocation routing |
| GET | `/resources/map?lat=lat&lon=lon&radiusKm=km` | Dashboard map view |

### ERT Module  
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/ert` | Register ERT unit with location |
| GET | `/ert` | List all units |
| GET | `/ert?region=RegionName` | Filter by region |
| PATCH | `/ert/{id}/location` | Update deployment location |
| PATCH | `/ert/{id}/status` | Update unit status |
| GET | `/ert/map` | Get all units for visualization |
| GET | `/ert/map?lat=lat&lon=lon&radiusKm=km` | Get nearby units |

---

## Testing

### Run API Tests
```bash
npm run build
npm run start:dev &
sleep 2
node test-ert-api.js
```

### Interactive Testing
```bash
# Create inventory:
curl -X POST http://localhost:3000/resources/inventory \
  -H "Content-Type: application/json" \
  -d '{
    "resourceID": "med-kit-01",
    "quantity": 100,
    "location": {"latitude": 9.0320, "longitude": 38.7469}
  }'

# Create ERT unit:
curl -X POST http://localhost:3000/ert \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Alpha Unit",
    "region": "Oromia Region",
    "latitude": 9.0320,
    "longitude": 38.7469
  }'

# Query nearby units (50km):
curl "http://localhost:3000/ert/map?lat=9.0320&lon=38.7469&radiusKm=50"
```

---

## PostGIS Spatial Queries

### Find nearby resources
```sql
SELECT *, 
  ST_Distance(location::geography, ST_SetSRID(ST_MakePoint(38.7469, 9.0320), 4326)::geography) / 1000 as distance_km
FROM inventory_items
WHERE ST_DWithin(location::geography, ST_SetSRID(ST_MakePoint(38.7469, 9.0320), 4326)::geography, 50000)
ORDER BY distance_km ASC
```

### Create spatial index for performance
```sql
CREATE INDEX idx_ert_units_location ON ert_units USING GIST(location);
CREATE INDEX idx_inventory_location ON inventory_items USING GIST(location);
```

---

## Build Status

✅ **TypeScript Build**: Passing
✅ **Modules**: Registered in app.module.ts
✅ **Migrations**: Ready (EnablePostGIS)
✅ **Docker Setup**: Updated with PostGIS image

---

## Next Steps (Optional Enhancements)

- [ ] Real-time location updates via WebSockets
- [ ] Movement history and replay functionality
- [ ] Route optimization between units
- [ ] Heat map visualization of deployment density
- [ ] Integration with incident management
- [ ] Mobile app for on-field updates
- [ ] Analytics dashboard (response times, coverage, etc.)

---

## Documentation Files

- [ERT Team Tracking Module](docs/ert-team-tracking.md)
- [Resource Allocation & Inventory](docs/resources-allocation.md)
- [PostGIS Integration Guide](docs/postgis-guide.md)
