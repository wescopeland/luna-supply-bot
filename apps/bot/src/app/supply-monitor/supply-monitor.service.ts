import { Injectable, Logger } from "@nestjs/common";
import dayjs from "dayjs";
import { lastValueFrom } from "rxjs";

import { DatabaseService } from "../integrations/database/database.service";
import { TerrascopeService } from "../integrations/terrascope/terrascope.service";

@Injectable()
export class SupplyMonitorService {
  #logger = new Logger(SupplyMonitorService.name);

  constructor(
    private readonly database: DatabaseService,
    private readonly terrascopeService: TerrascopeService
  ) {}

  async calculateDailyMetrics() {
    const todayDate = dayjs().format("YYYY-MM-DD");
    const yesterdayDate = dayjs().subtract(1, "day").format("YYYY-MM-DD");
    this.#logger.log(
      `Calculating the supply diff between ${todayDate} and ${yesterdayDate}.`
    );

    const todayEntry = await this.database.dailySupply.findFirst({
      where: { date: todayDate }
    });
    const yesterdayEntry = await this.database.dailySupply.findFirst({
      where: { date: yesterdayDate }
    });

    const circulatingSupplyDiff =
      todayEntry.circulatingSupply - yesterdayEntry.circulatingSupply;
    const totalSupplyDiff = todayEntry.totalSupply - yesterdayEntry.totalSupply;

    this.#logger.log(
      `Returning a circulating supply diff of ${circulatingSupplyDiff}.`
    );
    return {
      circulatingSupplyDiff,
      totalSupplyDiff,
      currentCirculating: todayEntry.circulatingSupply,
      currentTotal: todayEntry.totalSupply
    };
  }

  async recordCurrentSupply() {
    this.#logger.log("Recording the current LUNA supply.");

    const { uluna: fullLunaSupply } = await this.retrieveFullLunaSupply();
    const circulatingSupply = fullLunaSupply[0].circ / 1_000_000;
    const totalSupply = fullLunaSupply[0].total / 1_000_000;
    this.#logger.log(
      `💡 Found a circulating supply of ${circulatingSupply.toLocaleString()} and a totalSupply of ${totalSupply.toLocaleString()}.`
    );

    const latestSupplyMeasurement = await this.database.dailySupply.findFirst();

    this.#logger.log(
      `💾 Saving new circulating supply and total supply to entry ID ${latestSupplyMeasurement.id}.`
    );
    await this.database.dailySupply.upsert({
      where: { id: latestSupplyMeasurement.id },
      update: { circulatingSupply, totalSupply },
      create: { circulatingSupply, totalSupply, date: fullLunaSupply[0].date }
    });
    this.#logger.log(
      "✅ Successfully saved the current circulating supply and total supply."
    );
  }

  /**
   * This method will purge the entire database and replace it
   * with the supply values retrieved from the Terrascope API.
   */
  async unsafe_seedDatabaseWithHistoricalSupply() {
    this.#logger.log("🗑  Purging the database...");
    await this.database.dailySupply.deleteMany();
    this.#logger.log("✅ Successfully purged the database.");

    const { uluna: fullLunaSupply } = await this.retrieveFullLunaSupply();

    this.#logger.log("💾 Inserting supply history into the database...");
    await this.database.dailySupply.createMany({
      data: fullLunaSupply.map((terrascopeSupplyEntry) => ({
        circulatingSupply: terrascopeSupplyEntry.circ / 1_000_000,
        totalSupply: terrascopeSupplyEntry.total / 1_000_000,
        date: terrascopeSupplyEntry.date
      }))
    });
    this.#logger.log(
      "✅ Successfully inserted supply history into the database."
    );
  }

  private async retrieveFullLunaSupply() {
    this.#logger.log("📡 Retrieving the historical Luna supply...");
    const { data: lunaSupplyResponse } = await lastValueFrom(
      this.terrascopeService.fetchLunaSupply()
    );

    this.#logger.log("✅ Successfully retrieved the historical Luna supply.");
    return lunaSupplyResponse;
  }
}
