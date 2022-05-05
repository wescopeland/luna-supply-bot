import { Injectable, Logger } from "@nestjs/common";
import { TwitterApi } from "twitter-api-v2";

@Injectable()
export class TwitterService {
  #logger = new Logger(TwitterService.name);

  async sendTweet(text: string) {
    this.#logger.log("Logging in to Twitter...");
    const userClient = new TwitterApi({
      appKey: process.env["TWITTER_APP_KEY"],
      appSecret: process.env["TWITTER_APP_SECRET"],
      accessToken: process.env["TWITTER_ACCESS_TOKEN"],
      accessSecret: process.env["TWITTER_ACCESS_SECRET"]
    });

    // This will fail if the user isn't properly authenticated.
    await userClient.v2.me();
    this.#logger.log("Logged in to Twitter.");

    this.#logger.log(`Sending Tweet: ${text}`);
    await userClient.v2.tweet(text);
    this.#logger.log("Tweeted!");
  }
}
