import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";

import { TerrascopeService } from "./terrascope.service";

@Module({
  imports: [HttpModule],
  providers: [TerrascopeService],
  exports: [TerrascopeService]
})
export class TerrascopeModule {}
