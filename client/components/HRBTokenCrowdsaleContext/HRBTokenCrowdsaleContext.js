import { createContext, useContext, useState } from "react";
import { BigNumber, ethers } from 'ethers';
import { toWei, toEther } from '../../utils/utils';
import { MAX_UINT256 } from '../../utils/constants';
import HRBTokenCrowdsale from "./HRBTokenCrowdsale.json";
import { useEthContext } from "../EthContext/EthContext";

const HRBTokenCrowdsaleContractAddress = process.env.NEXT_PUBLIC_HRB_TOKEN_CROWDSALE_CONTRACT_ADDRESS;

export const HRBTokenCrowdsaleContext = createContext();

export const HRBTokenCrowdsaleContextProvider = ({ children }) => {
    const ethContext = useEthContext();
    const [hrbTokenCrowdsaleContractInstance, setHRBTokenCrowdsaleContractInstance] = useState();
    const [hrbTokenETHRate, setHRBTokenETHRate] = useState();

    const loadHRBTokenCrowdsaleContractInstance = async () => {
        setHRBTokenCrowdsaleContractInstance(new ethers.Contract(HRBTokenCrowdsaleContractAddress, HRBTokenCrowdsale.abi, ethContext.getEthProvider().getSigner(ethContext.selectedAccount)));
    };

    const loadHRBTokenETHRate = async () => {
        if (hrbTokenCrowdsaleContractInstance && ethContext.selectedAccount) {
            const hrbTokenETHRate = (await hrbTokenCrowdsaleContractInstance.getRate()).toString();
            setHRBTokenETHRate(hrbTokenETHRate);
        }
    };

    const buyHRBTokens = async (amount) => {
        await ethContext.getEthProvider().getSigner(ethContext.selectedAccount).sendTransaction({to: hrbTokenCrowdsaleContractInstance.address, value: toWei(amount).div(hrbTokenETHRate)})
    };

    const value = {
        loadHRBTokenCrowdsaleContractInstance,
        loadHRBTokenETHRate,
        hrbTokenETHRate,
        buyHRBTokens
    };

    return <HRBTokenCrowdsaleContext.Provider value={value}>{children}</HRBTokenCrowdsaleContext.Provider>;
};

export const useHRBTokenCrowdsaleContext = () => useContext(HRBTokenCrowdsaleContext);
