import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";
import { IExchange } from "./IExchange";


interface Options {
    client: IKraken;
}


export class KrakenExchange implements IExchange {
    constructor(private readonly options: Options) {}


    public async getBalance(symbol: string): Promise<number> {
        const balances = await this.options.client.request<{ result: never }>(KRAKEN_PRIVATE_METHOD.Balance);
        return balances.result[symbol] || 0;
    }


    public async getPrice(baseSymbol: string, quoteSymbol: string): Promise<number> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const price = await this.options.client.request<{ result: any }>(KRAKEN_PUBLIC_METHOD.Ticker, { pair });
        return price.result[pair].a[0] || Number.MAX_VALUE;
    }


    public async setOrder(baseSymbol: string, quoteSymbol: string, volume: string): Promise<string> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        const order = await this.options.client.request<{ result: { txid: string[] }}>(
            KRAKEN_PRIVATE_METHOD.AddOrder,
            {
                ordertype: "market",
                type: "buy",
                pair,
                volume
            }
        );
        return order.result.txid[0] || "unknown";
    }


    public async withdraw(symbol: string, volume: string, address: string): Promise<string> {
        const withdraw = await this.options.client.request<{ result: { refid: string }}>(
            KRAKEN_PRIVATE_METHOD.Withdraw,
            {
                asset: symbol,
                key: address,
                amount: volume
            }
        );
        return withdraw.result.refid || "unknown";
    }
}