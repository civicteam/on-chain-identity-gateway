import { ethers } from 'hardhat';

export async function advanceBlock() {
  return ethers.provider.send('evm_mine', []);
}

export async function advanceTime(time) {
  await ethers.provider.send('evm_increaseTime', [time]);
}
