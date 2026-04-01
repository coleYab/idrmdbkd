import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DonationModule } from './donation/donation.module';

import { AuthModule } from './auth/auth.module';
import { DisasterModule } from './disaster/disaster.module';
import { LocationModule } from './location/location.module';
import { IncidentModule } from './incident/incident.module';
import { ModuleModule } from './module/module.module';
import { SharedModule } from './shared/shared.module';
import { UserModule } from './user/user.module';
import { NotificationModule } from './notification/notification.module';
import { CommentModule } from './comment/comment.module';

@Module({
  imports: [
    SharedModule,
    UserModule,
    AuthModule,
    ModuleModule,
    IncidentModule,
    DisasterModule,
    LocationModule,
    DonationModule,
    NotificationModule,
    CommentModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
