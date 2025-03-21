import { OrderType, Side, Spot } from "@binance/connector-typescript";
import { config } from "../../../test/config";
import { BinanceExchange } from "../BinanceExchange";


if (!config.skipTests.includes("binance")) {
    let callTracker = "";
    let _error = false;

    beforeEach(async () => {
        callTracker = "";
        _error = false;
    });


    it("should call the correct library functions to get the balance", async () => {
        const exchange = new BinanceExchange({
            client: <Spot> <unknown> {
                userAsset: async (params: { asset: string }) => {
                    try {
                        callTracker = "userAsset ";
                        expect(params.asset).toEqual("BTC");
                        return [{
                            free: 10
                        }];
                    } catch (error) {
                        console.log((<Error> error).message);
                        _error = true;
                        throw new Error();
                    }
                },
            }
        });

        const balance = await exchange.getBalance("BTC");

        expect(callTracker.trim()).toEqual("userAsset");
        expect(_error).toEqual(false);
        expect(balance).toEqual(10);
    });


    it("should call the correct library functions to get the price", async () => {
        const exchange = new BinanceExchange({
            client: <Spot> <unknown> {
                symbolOrderBookTicker: async (params: { symbol: string }) => {
                    try {
                        callTracker = "symbolOrderBookTicker ";
                        expect(params.symbol).toEqual("BTCEUR");
                        return {
                            askPrice: 10
                        };
                    } catch (error) {
                        console.log((<Error> error).message);
                        _error = true;
                        throw new Error();
                    }
                },
            }
        });

        const price = await exchange.getPrice("BTC", "EUR");

        expect(callTracker.trim()).toEqual("symbolOrderBookTicker");
        expect(_error).toEqual(false);
        expect(price).toEqual(10);
    });


    it("should call the correct library functions to set an order", async () => {
        const exchange = new BinanceExchange({
            client: <Spot> <unknown> {
                newOrder: async (symbol: string, side: Side, type: OrderType, options: {quantity: number}) => {
                    try {
                        callTracker = "newOrder ";
                        expect(symbol).toEqual("BTCEUR");
                        expect(side).toEqual(Side.BUY);
                        expect(type).toEqual(OrderType.MARKET);
                        expect(options).toEqual({ quantity: 100 });
                        return {
                            orderId: "123"
                        };
                    } catch (error) {
                        console.log((<Error> error).message);
                        _error = true;
                        throw new Error();
                    }
                },
            }
        });

        const id = await exchange.setOrder("BTC", "EUR", "100");

        expect(callTracker.trim()).toEqual("newOrder");
        expect(_error).toEqual(false);
        expect(id).toEqual("123");
    });


    it("should call the correct library functions to withdraw", async () => {
        const exchange = new BinanceExchange({
            client: <Spot> <unknown> {
                withdraw: async (coin: string, address: string, volume: number) => {
                    try {
                        callTracker = "withdraw ";
                        expect(coin).toEqual("BTC");
                        expect(volume).toEqual(100);
                        expect(address).toEqual("myAddress");
                        return {
                            id: "123"
                        };
                    } catch (error) {
                        console.log((<Error> error).message);
                        _error = true;
                        throw new Error();
                    }
                },
            }
        });

        const id = await exchange.withdraw("BTC", "100", "myAddress");

        expect(callTracker.trim()).toEqual("withdraw");
        expect(_error).toEqual(false);
        expect(id).toEqual("123");
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}