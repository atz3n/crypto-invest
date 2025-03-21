import { logger } from "@atz3n/kraken-invest-common";
import { IExchange } from "../exchange/IExchange";


interface BuyParams {
    exchange: IExchange;
    quoteSymbol: string;
    quoteInvestingAmount: number;
    baseSymbol: string;
    volumeDecimals: number;
}

export async function buy(params: BuyParams): Promise<number> {
    const { exchange, quoteSymbol, quoteInvestingAmount, baseSymbol, volumeDecimals } = params;

    const balance = await exchange.getBalance(quoteSymbol);
    if (balance <= quoteInvestingAmount) {
        throw new Error("Not enough funds");
    }

    const price = await exchange.getPrice(baseSymbol, quoteSymbol);
    const volume = (quoteInvestingAmount / price).toFixed(volumeDecimals);
    const id = await exchange.setOrder(baseSymbol, quoteSymbol, volume);

    // eslint-disable-next-line max-len
    logger.info(`Set order ${id} to buy ${volume} ${baseSymbol} with ${quoteInvestingAmount} ${quoteSymbol}`);
    return Number(volume);
}