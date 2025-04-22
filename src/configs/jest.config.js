module.exports = {
  preset: "@shelf/jest-mongodb",
  testEnvironment: "node",
  coverageDirectory: "../../coverage",
  collectCoverageFrom: ["src/**/*.{js,jsx}"],
  roots: ["<rootDir>/src/__tests__"],
  moduleDirectories: ["node_modules", "src"],
  moduleNameMapper: {
    "^src/(.*)$": "<rootDir>/src/$1"
  },
  modulePaths: ["<rootDir>/src"]
};
