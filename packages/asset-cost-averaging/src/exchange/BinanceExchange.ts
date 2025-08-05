import { OrderType, Side, Spot } from "@binance/connector-typescript";
import { IExchange } from "./IExchange";


interface Options {
    client: Spot
}


export class BinanceExchange implements IExchange {
    constructor(private readonly options: Options) {}


    public async getBalance(symbol: string): Promise<number> {
        const balance = await this.options.client.userAsset({
            asset: symbol
        });
        return Number(balance[0].free) || 0;
    }


    public async getPrice(baseSymbol: string, quoteSymbol: string): Promise<number> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        const price = await this.options.client.symbolOrderBookTicker({
            symbol: pair
        });
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return Number((<any> price).askPrice);
    }


    public async setOrder(baseSymbol: string, quoteSymbol: string, volume: string): Promise<string> {
        const pair = `${baseSymbol}${quoteSymbol}`;
        const order = await this.options.client.newOrder(
            pair,
            Side.BUY,
            OrderType.MARKET,
            {
                quantity: Number(volume)
            }
        );
        return String(order.orderId);
    }


    public async withdraw(symbol: string, volume: string, address: string, network?: string): Promise<string> {
        const withdraw = await this.options.client.withdraw(
            symbol,
            address,
            Number(volume),
            network ? { network } : undefined
        );
        return withdraw.id;
    }
}