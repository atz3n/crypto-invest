import { OrderType, Side, Spot } from "@binance/connector-typescript";
import { IExchange } from "./IExchange";


interface Options {
    client: Spot
}

interface LotSizeFilter {
    filterType: string;
    stepSize: string;
    minQty: string;
    maxQty: string;
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

        const exchangeInfo = await this.options.client.exchangeInformation({ symbol: pair });
        const symbolInfo = exchangeInfo.symbols[0];
        const lotSizeFilter = <LotSizeFilter | undefined> symbolInfo.filters.find((filters) => {
            return this.isLotSizeFilter(filters);
        });

        if (lotSizeFilter) {
            const stepSize = Number(lotSizeFilter.stepSize);
            const minQty = Number(lotSizeFilter.minQty);
            const minQtyDecimal = this.getDecimalPlaces(lotSizeFilter.minQty);

            let quantity = Math.floor(Number(volume) / stepSize) * stepSize;
            if (quantity < minQty) {
                throw new Error(`Quantity ${quantity} is less than minimum ${minQty}`);
            }
            quantity = Number(quantity.toFixed(minQtyDecimal));

            const order = await this.options.client.newOrder(
                pair,
                Side.BUY,
                OrderType.MARKET,
                {
                    quantity
                }
            );
            return String(order.orderId);
        }

        throw new Error("Could not find LOT_SIZE filter for pair " + pair);
    }

    private getDecimalPlaces(value: string): number {
        const decimals = value.split(".")[1];
        return decimals ? decimals.length : 0;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private isLotSizeFilter(filter: any): filter is LotSizeFilter {
        return filter.filterType === "LOT_SIZE"
            && typeof filter.stepSize === "string"
            && typeof filter.minQty === "string";
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