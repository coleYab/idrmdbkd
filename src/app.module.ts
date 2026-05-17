import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommentModule } from './comment/comment.module';
import { DisasterModule } from './disaster/disaster.module';
import { DonationModule } from './donation/donation.module';
import { IncidentModule } from './incident/incident.module';
import { LocationModule } from './location/location.module';
import { ModuleModule } from './module/module.module';
import { NotificationModule } from './notification/notification.module';
import { ResourcesModule } from './resources/resources.module';
import { ErtModule } from './ert/ert.module';
import { SharedModule } from './shared/shared.module';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';

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
    UploadModule,
    ResourcesModule,
    ErtModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
