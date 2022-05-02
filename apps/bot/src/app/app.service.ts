import type { OnModuleInit} from "@nestjs/common";
import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class AppService implements OnModuleInit {
  private readonly logger = new Logger(AppService.name);

  async onModuleInit() {
    this.logger.log("AppService is running.");
  }
}
