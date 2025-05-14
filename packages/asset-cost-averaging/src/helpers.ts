import { logger } from "@atz3n/kraken-invest-common";
import { ScheduledTask } from "node-cron";
import { EnvVars } from "./lib/EnvVars";
import { IExchange } from "./exchange/IExchange";
import { IStateStore, State } from "./storage/state/IStateStore";
import { withdraw } from "./utils/funding";
import { buy } from "./utils/trading";


export async function initStateStore(stateStore: IStateStore): Promise<void> {
    const state = await stateStore.get();
    const pair = `${EnvVars.BASE_SYMBOL}${EnvVars.QUOTE_SYMBOL}`;

    if (!state || state.pair !== pair || state.schedule !== EnvVars.CRON_BUY_SCHEDULE) {
        await stateStore.upsert({
            counter: 0,
            pair,
            schedule: EnvVars.CRON_BUY_SCHEDULE,
            volume: 0
        });
    }
}


export async function buyConditionally(exchange: IExchange, stateStore: IStateStore): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let state = (await stateStore.get())!;
        if (EnvVars.NUMBER_OF_BUYS <= 0 || state.counter < EnvVars.NUMBER_OF_BUYS) {
            state = await buyAction(exchange, state);
            await stateStore.upsert(state);
        }
    } catch (error) {
        logger.error((<Error> error).message);
    }
}

async function buyAction(exchange: IExchange, state: State): Promise<State> {
    const volume = await buy({
        exchange,
        baseSymbol: EnvVars.BASE_SYMBOL,
        quoteInvestingAmount: EnvVars.QUOTE_INVESTING_AMOUNT,
        quoteSymbol: EnvVars.QUOTE_SYMBOL,
        volumeDecimals: EnvVars.VOLUME_DECIMAL
    });
    state.volume += volume;
    state.counter++;
    return state;
}


export async function stopAndWithdrawConditionally(
    exchange: IExchange,
    interval: NodeJS.Timeout,
    task: ScheduledTask,
    stateStore: IStateStore
): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const state = (await stateStore.get())!;
        if (state.counter >= EnvVars.NUMBER_OF_BUYS) {
            task.stop();
            clearInterval(interval);

            if (EnvVars.ENABLE_WITHDRAWAL && state.volume > 0) {
                await sleep(60); // wait until order is filled
                await withdrawAction(exchange, state);
                await stateStore.delete();
            }
        }
    } catch (error) {
        logger.error((<Error> error).message);
    }
}

async function sleep(seconds: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

async function withdrawAction(exchange: IExchange, state: State): Promise<State> {
    await withdraw({
        exchange,
        volume: state.volume,
        baseSymbol: EnvVars.BASE_SYMBOL,
        withdrawalAddress: EnvVars.WITHDRAWAL_ADDRESS
    });
    state.volume = 0;
    return state;
}


export async function withdrawConditionally(exchange: IExchange, stateStore: IStateStore): Promise<void> {
    try {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        let state = (await stateStore.get())!;
        if (state.volume > 0) {
            state = await withdrawAction(exchange, state);
            await stateStore.upsert(state);
        }
    } catch (error) {
        console.log(error);
        logger.error((<Error> error).message);
    }
}