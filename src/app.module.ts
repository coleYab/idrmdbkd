import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { IncidentModule } from './incident/incident.module';
import { ModuleModule } from './module/module.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [SharedModule, UserModule, AuthModule, ModuleModule, IncidentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
