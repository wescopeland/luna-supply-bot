import { Module } from "@nestjs/common";

import { DatabaseModule } from "../integrations/database/database.module";
import { TerrascopeModule } from "../integrations/terrascope/terrascope.module";
import { SupplyMonitorService } from "./supply-monitor.service";

@Module({
  imports: [DatabaseModule, TerrascopeModule],
  providers: [SupplyMonitorService],
  exports: [SupplyMonitorService]
})
export class SupplyMonitorModule {}
