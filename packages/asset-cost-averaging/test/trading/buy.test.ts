import { ExchangeMock } from "../../src/exchange/ExchangeMock";
import { buyConditionally, initStateStore } from "../../src/helpers";
import { EnvVars } from "../../src/lib/EnvVars";
import { createStateStore } from "../../src/storage/state/stateStoreFactory";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { StorageType } from "../../src/storage/StorageType";
import { config } from "../config";


if (!config.skipTests.includes("buy")) {
    let stateStore: StateStoreInMemory;
    let callTracker = "";
    let _error = false;

    beforeEach(async () => {
        stateStore = <StateStoreInMemory> createStateStore(StorageType.IN_MEMORY);
        await initStateStore(stateStore);
        callTracker = "";
        _error = false;
    });


    it("should successfully buy", async () => {
        const exchange = new ExchangeMock({
            getBalanceCb: (symbol) => {
                try {
                    callTracker += "getBalanceCb ";
                    expect(symbol).toEqual(EnvVars.QUOTE_SYMBOL);
                    return 30;
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            },
            getPriceCb: (baseSymbol, quoteSymbol) => {
                try {
                    callTracker += "getPriceCb ";
                    expect(baseSymbol).toEqual(EnvVars.BASE_SYMBOL);
                    expect(quoteSymbol).toEqual(EnvVars.QUOTE_SYMBOL);
                    return 10;
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            },
            setOrderCb: (baseSymbol, quoteSymbol, volume) => {
                try {
                    callTracker += "setOrderCb ";
                    expect(baseSymbol).toEqual(EnvVars.BASE_SYMBOL);
                    expect(quoteSymbol).toEqual(EnvVars.QUOTE_SYMBOL);
                    expect(Number(volume)).toEqual(EnvVars.QUOTE_INVESTING_AMOUNT / 10);
                    return "";
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            }
        });
        await buyConditionally(exchange, stateStore);

        expect(callTracker.trim()).toEqual("getBalanceCb getPriceCb setOrderCb");
        expect(_error).toEqual(false);
        expect(stateStore.store[0].volume).toEqual(1);
        expect(stateStore.store[0].counter).toEqual(1);
    });


    it("should not buy in case the counter exceeded the number of buys", async () => {
        EnvVars.NUMBER_OF_BUYS = 2;
        stateStore.store[0].counter = 3;
        const exchange = new ExchangeMock({
            getBalanceCb: (symbol) => {
                try {
                    callTracker += "getBalanceCb ";
                    return 30;
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            }
        });
        await buyConditionally(exchange, stateStore);

        expect(callTracker.trim()).toEqual("");
        expect(_error).toEqual(false);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}