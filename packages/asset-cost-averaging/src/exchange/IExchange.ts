export interface IExchange {
    getPrice(baseSymbol: string, quoteSymbol: string): Promise<number>;
    getBalance(symbol: string): Promise<number>;
    setOrder(baseSymbol: string, quoteSymbol: string, volume: string): Promise<string>;
    withdraw(symbol: string, volume: string, address: string): Promise<string>;
}