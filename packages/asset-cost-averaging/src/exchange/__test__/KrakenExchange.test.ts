import { IKraken, KRAKEN_PRIVATE_METHOD, KRAKEN_PUBLIC_METHOD } from "@atz3n/kraken-invest-common";
import { config } from "../../../test/config";
import { KrakenExchange } from "../KrakenExchange";


if (!config.skipTests.includes("kraken")) {
    let callTracker = "";
    let _error = false;

    beforeEach(async () => {
        callTracker = "";
        _error = false;
    });


    it("should call the correct library functions to get the balance", async () => {
        const exchange = new KrakenExchange({
            client: <IKraken> <unknown> {
                request: async (method: KRAKEN_PRIVATE_METHOD) => {
                    try {
                        callTracker = "request ";
                        expect(method).toEqual(KRAKEN_PRIVATE_METHOD.Balance);
                        return {
                            result: {
                                "BTC": 10
                            }
                        };
                    } catch (error) {
                        console.log((<Error> error).message);
                        _error = true;
                        throw new Error();
                    }
                },
            }
        });

        const balance = await exchange.getBalance("BTC");

        expect(callTracker.trim()).toEqual("request");
        expect(_error).toEqual(false);
        expect(balance).toEqual(10);
    });


    it("should call the correct library functions to get the price", async () => {
        const exchange = new KrakenExchange({
            client: <IKraken> <unknown> {
                request: async (method: KRAKEN_PUBLIC_METHOD, params: {pair: string}) => {
                    try {
                        callTracker = "request ";
                        expect(method).toEqual(KRAKEN_PUBLIC_METHOD.Ticker);
                        expect(params).toEqual({ pair: "BTCEUR" });
                        return {
                            result: {
                                "BTCEUR": {
                                    a: [
                                        10
                                    ]
                                }
                            }
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

        expect(callTracker.trim()).toEqual("request");
        expect(_error).toEqual(false);
        expect(price).toEqual(10);
    });


    it("should call the correct library functions to set an order", async () => {
        const exchange = new KrakenExchange({
            client: <IKraken> <unknown> {
                request: async (
                    method: KRAKEN_PRIVATE_METHOD,
                    params: { ordertype: string, type: string, pair:string, volume: string }
                ) => {
                    try {
                        callTracker = "request ";
                        expect(method).toEqual(KRAKEN_PRIVATE_METHOD.AddOrder);
                        expect(params).toEqual({
                            ordertype: "market",
                            type: "buy",
                            pair: "BTCEUR",
                            volume: "100"
                        });
                        return {
                            result: {
                                txid: [
                                    "123"
                                ]
                            }
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

        expect(callTracker.trim()).toEqual("request");
        expect(_error).toEqual(false);
        expect(id).toEqual("123");
    });


    it("should call the correct library functions to withdraw", async () => {
        const exchange = new KrakenExchange({
            client: <IKraken> <unknown> {
                request: async (
                    method: KRAKEN_PRIVATE_METHOD,
                    params: { asset: string, key: string, amount: string }
                ) => {
                    try {
                        callTracker = "request ";
                        expect(method).toEqual(KRAKEN_PRIVATE_METHOD.Withdraw);
                        expect(params).toEqual({
                            asset: "BTC",
                            key: "myAddress",
                            amount: "100"
                        });
                        return {
                            result: {
                                refid: "123"
                            }
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

        expect(callTracker.trim()).toEqual("request");
        expect(_error).toEqual(false);
        expect(id).toEqual("123");
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}