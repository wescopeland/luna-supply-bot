import { type OnModuleInit, Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

import { SupplyMonitorService } from "./supply-monitor/supply-monitor.service";

@Injectable()
export class AppService implements OnModuleInit {
  #logger = new Logger(AppService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly supplyMonitorService: SupplyMonitorService
  ) {}

  async onModuleInit() {
    this.startHourlyJob();
    this.startFrequentJob();
  }

  startFrequentJob() {
    // This job will run every 5 minutes during the day.
    const frequentCronExpression = "*/5 1-23 * * *";

    const frequentJob = new CronJob(frequentCronExpression, async () => {
      try {
        const dailySupplyMetrcs =
          await this.supplyMonitorService.calculateDailyMetrics();

        const isBurning = dailySupplyMetrcs.circulatingSupplyDiff < 0;
        const sanitizedCirculatingSupplyDiff = Math.abs(
          Number(dailySupplyMetrcs.circulatingSupplyDiff.toFixed(0))
        );

        const sanitizedCirculatingSupply = Math.abs(
          Number(dailySupplyMetrcs.currentCirculating.toFixed(0))
        );

        this.#logger.log(
          `The $LUNA circulating supply has ${
            isBurning ? "decreased" : "increased"
          } today by ${sanitizedCirculatingSupplyDiff.toLocaleString()}. There are ${sanitizedCirculatingSupply.toLocaleString()} LUNA circulating.`
        );
      } catch (error) {
        this.#logger.error(error);
      }
    });

    this.schedulerRegistry.addCronJob("Frequent", frequentJob);
    frequentJob.start();

    this.#logger.log("Started the Frequent job.");
  }

  startHourlyJob() {
    const hourlyCronExpression = "0 * * * *";

    const hourlyJob = new CronJob(hourlyCronExpression, async () => {
      try {
        await this.supplyMonitorService.recordCurrentSupply();
      } catch (error) {
        this.#logger.error(
          "There was a problem recording the current Luna supply.",
          error
        );
      }
    });

    this.schedulerRegistry.addCronJob("Hourly", hourlyJob);
    hourlyJob.start();

    this.#logger.log(
      "Started the hourly job for recording the Luna supply from Terrascope."
    );
  }
}
