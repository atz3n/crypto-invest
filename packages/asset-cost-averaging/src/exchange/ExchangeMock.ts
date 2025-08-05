import { IExchange } from "./IExchange";


interface Options {
    getPriceCb?: (baseSymbol: string, quoteSymbol: string) => number;
    getBalanceCb?: (symbol: string) => number;
    setOrderCb?: (baseSymbol: string, quoteSymbol: string, volume: string) => string;
    withdrawCb?: (symbol: string, volume: string, address: string, network?: string) => string;
}


export class ExchangeMock implements IExchange {
    constructor(private readonly options: Options) {}


    public async getPrice(baseSymbol: string, quoteSymbol: string): Promise<number> {
        if (this.options.getPriceCb) {
            return this.options.getPriceCb(baseSymbol, quoteSymbol);
        }
        return 0;
    }


    public async getBalance(symbol: string): Promise<number> {
        if (this.options.getBalanceCb) {
            return this.options.getBalanceCb(symbol);
        }
        return 0;
    }


    public async setOrder(baseSymbol: string, quoteSymbol: string, volume: string): Promise<string> {
        if (this.options.setOrderCb) {
            return this.options.setOrderCb(baseSymbol, quoteSymbol, volume);
        }
        return "";
    }


    public async withdraw(symbol: string, volume: string, address: string, network?: string): Promise<string> {
        if (this.options.withdrawCb) {
            return this.options.withdrawCb(symbol, volume, address, network);
        }
        return "";
    }
}