import { ExchangeMock } from "../../src/exchange/ExchangeMock";
import { initStateStore, withdrawConditionally } from "../../src/helpers";
import { EnvVars } from "../../src/lib/EnvVars";
import { createStateStore } from "../../src/storage/state/stateStoreFactory";
import { StateStoreInMemory } from "../../src/storage/state/StateStoreInMemory";
import { StorageType } from "../../src/storage/StorageType";
import { config } from "../config";


if (!config.skipTests.includes("withdraw")) {
    let stateStore: StateStoreInMemory;
    let callTracker = "";
    let _error = false;

    beforeEach(async () => {
        stateStore = <StateStoreInMemory> createStateStore(StorageType.IN_MEMORY);
        await initStateStore(stateStore);
        callTracker = "";
        _error = false;
    });


    it("should successfully withdraw the volume amount", async () => {
        stateStore.store[0].volume = 10;
        const exchange = new ExchangeMock({
            getBalanceCb: (symbol) => {
                try {
                    callTracker += "getBalanceCb ";
                    expect(symbol).toEqual(EnvVars.BASE_SYMBOL);
                    return 30;
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            },
            withdrawCb: (symbol, volume, address) => {
                try {
                    callTracker += "withdrawCb ";
                    expect(symbol).toEqual(EnvVars.BASE_SYMBOL);
                    expect(volume).toEqual("10");
                    expect(address).toEqual(EnvVars.WITHDRAWAL_ADDRESS);
                    return "";
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            }
        });
        await withdrawConditionally(exchange, stateStore);

        expect(callTracker.trim()).toEqual("getBalanceCb withdrawCb");
        expect(_error).toEqual(false);
        expect(stateStore.store[0].volume).toEqual(0);
    });


    it("should successfully withdraw the balance amount", async () => {
        stateStore.store[0].volume = 30;
        const exchange = new ExchangeMock({
            getBalanceCb: (symbol) => {
                try {
                    callTracker += "getBalanceCb ";
                    expect(symbol).toEqual(EnvVars.BASE_SYMBOL);
                    return 10;
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            },
            withdrawCb: (symbol, volume, address) => {
                try {
                    callTracker += "withdrawCb ";
                    expect(symbol).toEqual(EnvVars.BASE_SYMBOL);
                    expect(volume).toEqual("10");
                    expect(address).toEqual(EnvVars.WITHDRAWAL_ADDRESS);
                    return "";
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            }
        });
        await withdrawConditionally(exchange, stateStore);

        expect(callTracker.trim()).toEqual("getBalanceCb withdrawCb");
        expect(_error).toEqual(false);
        expect(stateStore.store[0].volume).toEqual(0);
    });


    it("should not withdraw the balance amount in case the volume is 0", async () => {
        stateStore.store[0].volume = 0;
        const exchange = new ExchangeMock({
            getBalanceCb: (symbol) => {
                callTracker += "getBalanceCb ";
                return 0;
            },
            withdrawCb: (symbol, volume, address) => {
                callTracker += "withdrawCb ";
                return "";
            }
        });
        await withdrawConditionally(exchange, stateStore);

        expect(callTracker.trim()).toEqual("");
    });


    it("should not withdraw if balance amount is 0", async () => {
        stateStore.store[0].volume = 10;
        const exchange = new ExchangeMock({
            getBalanceCb: (symbol) => {
                try {
                    callTracker += "getBalanceCb ";
                    expect(symbol).toEqual(EnvVars.BASE_SYMBOL);
                    return 0;
                } catch (error) {
                    console.log((<Error> error).message);
                    _error = true;
                    throw new Error();
                }
            },
            withdrawCb: (symbol, volume, address) => {
                callTracker += "withdrawCb ";
                return "";
            }
        });
        await withdrawConditionally(exchange, stateStore);

        expect(callTracker.trim()).toEqual("getBalanceCb");
        expect(_error).toEqual(false);
        expect(stateStore.store[0].volume).toEqual(0);
    });
} else {
    test("dummy", () => {
        expect(true).toBeTruthy();
    });
}