import { ConsoleTransport, FileTransport, initLogger, Kraken, logger } from "@atz3n/kraken-invest-common";
import { Spot } from "@binance/connector-typescript";
import { schedule } from "node-cron";
import { buyConditionally, initStateStore, stopAndWithdrawConditionally, withdrawConditionally } from "./helpers";
import { BinanceExchange } from "./exchange/BinanceExchange";
import { EnvVars } from "./lib/EnvVars";
import { IExchange } from "./exchange/IExchange";
import { KrakenExchange } from "./exchange/KrakenExchange";
import { createStateStore } from "./storage/state/stateStoreFactory";
import { StorageType } from "./storage/StorageType";

// const apiKey = "MBZKRZAFl5EJMi9wIVxWfJ1ImECbiJxpvaQWNdCVHnF5ed97BSrd5a8QRYRhK9Nr";
    // const apiSecret = "OESZrgc96QhefL2F8a5nCACGrYua1KwQYf46V3gjnspFCcaDSlgk2B1G4F6Elyws";
async function main() {
    initLogger({
        level: "info",
        transports: EnvVars.ENABLE_FILE_LOGGING
            ? [ new ConsoleTransport(), new FileTransport() ]
            : [ new ConsoleTransport() ]
    });

    logger.info("Init database...");
    const stateStore = createStateStore(EnvVars.MONGO_DB_URL
        ? StorageType.MONGO_DB
        : StorageType.IN_MEMORY
    );
    await initStateStore(stateStore);

    logger.info("Init exchange...");
    let exchange = <IExchange> {};

    if (EnvVars.EXCHANGE === "kraken") {
        exchange = new KrakenExchange({
            client: new Kraken({
                apiKeyId: EnvVars.API_KEY,
                apiKeySecret: EnvVars.PRIVATE_KEY
            })
        });
    }

    if (EnvVars.EXCHANGE === "binance") {
        exchange = new BinanceExchange({
            client: new Spot(
                EnvVars.API_KEY,
                EnvVars.PRIVATE_KEY
            )
        });
    }

    const task = schedule(EnvVars.CRON_BUY_SCHEDULE, async () => {
        await buyConditionally(exchange, stateStore);
    });

    if (EnvVars.NUMBER_OF_BUYS > 0) {
        const interval = setInterval(() => {
            stopAndWithdrawConditionally(exchange, interval, task, stateStore);
        }, 1000);
    } else if (EnvVars.ENABLE_WITHDRAWAL) {
        schedule(EnvVars.CRON_WITHDRAW_SCHEDULE, async () => {
            await withdrawConditionally(exchange, stateStore);
        });
    }

    logger.info("Done. Asset Cost Averaging Bot started.");
}


main();