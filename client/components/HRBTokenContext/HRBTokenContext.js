import { createContext, useContext, useState } from "react";
import { BigNumber, ethers } from 'ethers';
import { toWei, toEther } from '../../utils/utils';
import { MAX_UINT256 } from '../../utils/constants';
import HRBToken from "./HRBToken.json";
import { useEthContext } from "../EthContext/EthContext";

const HRBTokenContractAddress = process.env.NEXT_PUBLIC_HRB_TOKEN_CONTRACT_ADDRESS;
const HRBTokenCrowdsaleContractAddress = process.env.NEXT_PUBLIC_HRB_TOKEN_CROWDSALE_CONTRACT_ADDRESS;

export const HRBTokenContext = createContext();

export const HRBTokenContextProvider = ({ children }) => {
    const ethContext = useEthContext();
    const [hrbTokenContractInstance, setHRBTokenContractInstance] = useState();
    const [hrbTokenBalance, setHRBTokenBalance] = useState();

    const loadHRBTokenContractInstance = async () => {
        setHRBTokenContractInstance(new ethers.Contract(HRBTokenContractAddress, HRBToken.abi, ethContext.getEthProvider().getSigner(ethContext.selectedAccount)));
    };

    const loadHRBTokenBalance = async () => {
        if (hrbTokenContractInstance && ethContext.selectedAccount) {
            const hrbTokenBalance = (await hrbTokenContractInstance.balanceOf(ethContext.selectedAccount)).toString();
            setHRBTokenBalance(hrbTokenBalance);
            listenTransfers();
        }
    };

    const approveCrowdsaleContract = async () => {
        await hrbTokenContractInstance.approve(HRBTokenCrowdsaleContractAddress, MAX_UINT256);
    };

    const listenTransfers = () => {
        const filter = hrbTokenContractInstance.filters.Transfer(null, ethContext.selectedAccount);
        ethContext.getEthProvider().on(filter, loadHRBTokenBalance);
    }

    const value = {
        loadHRBTokenContractInstance,
        loadHRBTokenBalance,
        hrbTokenBalance,
        approveCrowdsaleContract
    };

    return <HRBTokenContext.Provider value={value}>{children}</HRBTokenContext.Provider>;
};

export const useHRBTokenContext = () => useContext(HRBTokenContext);
