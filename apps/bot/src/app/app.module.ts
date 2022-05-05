import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";

import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { TwitterModule } from "./integrations/twitter/twitter.module";
import { SupplyMonitorModule } from "./supply-monitor/supply-monitor.module";

@Module({
  imports: [ScheduleModule.forRoot(), SupplyMonitorModule, TwitterModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
