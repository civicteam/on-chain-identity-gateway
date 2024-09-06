// This file imports the default hardhat config and adds the tasks
// Use this whenever executing a task rather than the default config, so that the default config can be loaded
// before the contracts are compiled and typechain typings are created
// yarn hardhat --config hardhat-tasks.config.ts <MY TASK>
// Note 1: yarn build must be run beforehand
// Note 2: The file must remain at the top level to ensure the compile task correctly finds the contracts
import './config/tasks'
export * from './hardhat.config'
