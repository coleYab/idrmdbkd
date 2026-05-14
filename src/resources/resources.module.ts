import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SharedModule } from '../shared/shared.module';
import { InventoryItemsService } from './application/services/inventory-items.service';
import { ResourceService } from './application/services/resource.service';
import { ResourceNeedService } from './application/services/resource-need.service';
import { CreateResourceUseCase } from './application/use-cases/create/create-resource.use-case';
import { CreateResourceCampagnUseCase } from './application/use-cases/create/create-resource-campaign.use-case';
import { UpdateResourceUseCase } from './application/use-cases/update/update-resource.use-case';
import { INVENTORY_ITEMS_REPOSITORY } from './domain/repositories/inventory-items.repository';
import { RESOURCE_REPOSITORY } from './domain/repositories/resource.repository';
import { RESOURCE_NEED_REPOSITORY } from './domain/repositories/resource-need.repository';
import { InventoryItemsTypeOrmRepository } from './infrastructure/persistence/repositories/inventory-items-typeorm.repository';
import { ResourceNeedTypeOrmRepository } from './infrastructure/persistence/repositories/resource-need-typeorm.repository';
import { ResourceTypeOrmRepository } from './infrastructure/persistence/repositories/resource-typeorm.repository';
import { InventoryItemsTypeOrmEntity } from './infrastructure/persistence/typeorm/inventory-items-typeorm.entity';
import { ResourceNeedTypeOrmEntity } from './infrastructure/persistence/typeorm/resource-need-typeorm.entity';
import { ResourceTypeOrmEntity } from './infrastructure/persistence/typeorm/resource-typeorm.entity';
import { InventoryController } from './interfaces/http/controllers/inventory.controller';
import { ResourceController } from './interfaces/http/controllers/resource.controller';
import { ResourceNeedController } from './interfaces/http/controllers/resource-need.controller';

@Module({
  imports: [
    SharedModule,
    TypeOrmModule.forFeature([
      ResourceTypeOrmEntity,
      ResourceNeedTypeOrmEntity,
      InventoryItemsTypeOrmEntity,
    ]),
  ],
  controllers: [
    ResourceController,
    ResourceNeedController,
    InventoryController,
  ],
  providers: [
    CreateResourceUseCase,
    CreateResourceCampagnUseCase,
    ResourceService,
    ResourceNeedService,
    InventoryItemsService,
    UpdateResourceUseCase,
    {
      provide: RESOURCE_REPOSITORY,
      useClass: ResourceTypeOrmRepository,
    },
    {
      provide: RESOURCE_NEED_REPOSITORY,
      useClass: ResourceNeedTypeOrmRepository,
    },
    {
      provide: INVENTORY_ITEMS_REPOSITORY,
      useClass: InventoryItemsTypeOrmRepository,
    },
  ],
  exports: [
    RESOURCE_REPOSITORY,
    RESOURCE_NEED_REPOSITORY,
    INVENTORY_ITEMS_REPOSITORY,
  ],
})
export class ResourcesModule {}
