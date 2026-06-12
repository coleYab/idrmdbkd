# IDRMC — Integrated Disaster Response Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

A backend platform for managing the full lifecycle of disaster response operations. Emergency personnel can report incidents, declare disasters, track response teams on a map, manage resource inventory and allocation, process donations and crowdfunding, and communicate via push notifications and email.

Built with [NestJS](https://nestjs.com/), powered by **PostgreSQL + PostGIS** for spatial data, and integrated with Ethiopian payment gateways (Chapa, Telebirr).

## Modules

| Module | Description |
|--------|-------------|
| **Incident** | Emergency reports (flood, drought, landslide, fire, conflict, locust) with severity, location, affected population, infrastructure damage, and attachments |
| **Disaster** | Formal disaster declarations linked to verified incidents, with budget allocation, economic loss estimates, and lifecycle state management |
| **ERT** | Emergency Response Team tracking — register units, monitor deployment status (idle/deployed/maintenance), and find nearby teams via PostGIS spatial queries |
| **Resources** | Resource catalog, geographically-tracked inventory stockpiles, incident-linked needs with priority/status, and GIS-based allocation routing |
| **Donation** | Crowdfunding campaigns tied to disasters, payment processing via Chapa (Bank Transfer, Telebirr), idempotent transactions, and PDF receipt generation |
| **Notification** | In-app notifications, Expo push notifications, and Resend transactional email broadcasts |
| **Comment** | User comments and updates on disasters with file attachments |
| **Auth / User** | JWT-based authentication, RBAC (USER/ADMIN roles), Clerk integration, and profile management |
| **Audit Log** | Immutable audit trail for all CRUD operations across the system |
| **Location** | Generic geographic location records |
| **Upload** | Static file serving for attachments and images |

## Tech Stack

- **Runtime:** Node.js, TypeScript 5
- **Framework:** NestJS 10 (monolithic REST API)
- **Database:** PostgreSQL 16 + PostGIS 3.4
- **ORM:** TypeORM 0.3 with migrations
- **Auth:** JWT (RS256), Passport.js, Clerk
- **Payments:** Chapa (Bank Transfer, Telebirr)
- **Notifications:** Expo Server SDK (APNs/FCM), Resend (email)
- **PDF:** PDFKit (donation receipts)
- **API Docs:** Swagger / OpenAPI
- **Validation:** class-validator, class-transformer
- **Logging:** Winston
- **Testing:** Jest, Supertest (E2E)
- **CI:** SonarCloud, GitHub Actions
- **Containerization:** Docker, Docker Compose

## Architecture

- Domain-driven structure: each module follows `domain/`, `application/`, `infrastructure/`, `interfaces/` layers
- API prefix: `/api/v1/`
- CQRS-style domain events (IncidentCreated, DonationCompleted, CampaignGoalMet, etc.)
- Spatial queries via PostGIS `geometry(Point, 4326)` with `ST_DWithin` and `ST_Distance`
- [Detailed project structure](./docs/project-structure.md)

## Installation

Note: when using Docker, all `npm` commands can also be run via `./scripts/npm` (e.g. `./scripts/npm install`) to use the same environment and versions as the service, regardless of what is installed on the host.

```bash
$ npm install
```

Create a `.env` file from the template `.env.template` file.

Generate public and private key pair for jwt authentication:

### With docker

Run this command:
```bash
./scripts/generate-jwt-keys
```

It will output something like this. You only need to add it to your `.env` file.
```
To setup the JWT keys, please add the following values to your .env file:
JWT_PUBLIC_KEY_BASE64="(long base64 content)"
JWT_PRIVATE_KEY_BASE64="(long base64 content)"
```

### Without docker

```bash
$ ssh-keygen -t rsa -b 2048 -m PEM -f jwtRS256.key
# Don't add passphrase
$ openssl rsa -in jwtRS256.key -pubout -outform PEM -out jwtRS256.key.pub
```

You may save these key files in `./local` directory as it is ignored in git.

Encode keys to base64:

```bash
$ base64 -i local/jwtRS256.key

$ base64 -i local/jwtRS256.key.pub
```

Must enter the base64 of the key files in `.env`:

```bash
JWT_PUBLIC_KEY_BASE64=BASE64_OF_JWT_PUBLIC_KEY
JWT_PRIVATE_KEY_BASE64=BASE64_OF_JWT_PRIVATE_KEY
```

## Running the app

We can run the project with or without docker.

### Local

To run the server without Docker we need this pre-requisite:

- Postgres server running

Commands:

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

### Docker

```bash
# build image
$ docker build -t my-app .

# run container from image
$ docker run -p 3000:3000 --volume 'pwd':/usr/src/app --network --env-file .env my-app

# run using docker compose
$ docker compose up
```

The Docker Compose setup includes a PostGIS container so the database is automatically provisioned.

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Migrations

```bash
# using docker
docker compose exec app npm run migration:run

# generate migration (replace CreateUsers with the migration name)
npm run migration:generate --name=CreateUsers

# run migration
npm run migration:run

# revert migration
npm run migration:revert
```