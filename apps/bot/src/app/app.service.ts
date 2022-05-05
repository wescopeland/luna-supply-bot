import { type OnModuleInit, Injectable, Logger } from "@nestjs/common";
import { SchedulerRegistry } from "@nestjs/schedule";
import { CronJob } from "cron";

import { TwitterService } from "./integrations/twitter/twitter.service";
import { SupplyMonitorService } from "./supply-monitor/supply-monitor.service";

@Injectable()
export class AppService implements OnModuleInit {
  #logger = new Logger(AppService.name);

  constructor(
    private readonly schedulerRegistry: SchedulerRegistry,
    private readonly supplyMonitorService: SupplyMonitorService,
    private readonly twitterService: TwitterService
  ) {}

  async onModuleInit() {
    // Always boot with the latest supply metrics.
    await this.supplyMonitorService.recordCurrentSupply();

    this.startHourlyJob();
    this.startDailyJob();
  }

  private async constructTweetText() {
    const dailySupplyMetrcs =
      await this.supplyMonitorService.calculateDailyMetrics();

    const isBurning = dailySupplyMetrcs.circulatingSupplyDiff < 0;
    const sanitizedCirculatingSupplyDiff = Math.abs(
      Number(dailySupplyMetrcs.circulatingSupplyDiff.toFixed(0))
    );

    const sanitizedCirculatingSupply = Math.abs(
      Number(dailySupplyMetrcs.currentCirculating.toFixed(0))
    );

    const emojiPrefix = isBurning ? "🔥" : "✨";

    const tweetText = `${emojiPrefix} The $LUNA circulating supply ${
      isBurning ? "decreased" : "increased"
    } today by ${sanitizedCirculatingSupplyDiff.toLocaleString()}. There are ${sanitizedCirculatingSupply.toLocaleString()} LUNA circulating.`;
    this.#logger.log(`Constructed tweet text: ${tweetText}`);

    return tweetText;
  }

  private startDailyJob() {
    // This job will run once a day at 11PM UTC (7PM Eastern)
    const dailyCronExpression = "55 23 * * *";

    const dailyJob = new CronJob(dailyCronExpression, async () => {
      try {
        // Construct and send the daily recurring tweet.
        const tweetText = await this.constructTweetText();
        await this.twitterService.sendTweet(tweetText);
      } catch (error) {
        this.#logger.error(error);
      }
    });

    this.schedulerRegistry.addCronJob("Daily", dailyJob);
    dailyJob.start();

    this.#logger.log("Started the daily job to tweet the Luna supply.");
  }

  private startHourlyJob() {
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
