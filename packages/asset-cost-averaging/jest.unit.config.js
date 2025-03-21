module.exports = {
    testEnvironment: "node",
    roots: [
        "<rootDir>/src"
    ],
    transform: {
        "^.+\\.ts?$": "ts-jest"
    },
    setupFilesAfterEnv: [
        "./test/setup.ts"
    ],
    verbose: true
};