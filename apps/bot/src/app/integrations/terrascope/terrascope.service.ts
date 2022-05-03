import { HttpService } from "@nestjs/axios";
import { Injectable } from "@nestjs/common";
import urlcat from "urlcat";

import type { TerrascopeSupplyResponse } from "./models";

@Injectable()
export class TerrascopeService {
  constructor(private readonly httpService: HttpService) {}

  fetchLunaSupply() {
    const apiBaseUrl = "https://api.extraterrestrial.money/v1/api";
    const requestUrl = urlcat(apiBaseUrl, "/supply", { denom: "uluna" });

    return this.httpService.get<TerrascopeSupplyResponse>(requestUrl);
  }
}
