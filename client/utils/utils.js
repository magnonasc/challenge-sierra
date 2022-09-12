import { BigNumber } from "ethers";

export const toWei = (amount) => BigNumber.from(amount).mul('1000000000000000000');

export const toEther = (amount) => BigNumber.from(amount).div('1000000000000000000');