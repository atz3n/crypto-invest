import { logger } from "@atz3n/kraken-invest-common";
import { IExchange } from "../exchange/IExchange";


interface WithdrawParams {
    exchange: IExchange;
    volume: number;
    baseSymbol: string;
    withdrawalAddress: string;
    withdrawalNetwork: string;
}

export async function withdraw(params: WithdrawParams): Promise<void> {
    const { exchange, volume, baseSymbol, withdrawalAddress, withdrawalNetwork } = params;

    const balance = await exchange.getBalance(baseSymbol);
    if (balance === 0) {
        logger.info(`No ${baseSymbol} to withdraw`);
        return;
    }
    const withdrawAmount = Math.min(balance, volume);
    const id = await exchange.withdraw(baseSymbol, String(withdrawAmount), withdrawalAddress, withdrawalNetwork);

    logger.info(`Set withdrawal ${id} to withdraw ${withdrawAmount} ${baseSymbol}`);
}