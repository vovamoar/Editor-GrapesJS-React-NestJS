import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SitesModule } from './sites/sites.module';

@Module({
  imports: [SitesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
