import { createContext, useContext, useState } from "react";
import { BigNumber, ethers } from 'ethers';
import { toWei, toEther } from '../../utils/utils';
import { MAX_UINT256 } from '../../utils/constants';
import HurbBikeShareManager from "./HurbBikeShareManager.json";
import { useEthContext } from "../EthContext/EthContext";

const HurbBikeShareManagerContractAddress = process.env.NEXT_PUBLIC_HURB_BIKE_SHARE_MANAGER_CONTRACT_ADDRESS;

export const HurbBikeShareManagerContext = createContext();

export const HurbBikeShareManagerContextProvider = ({ children }) => {
    const ethContext = useEthContext();
    const [hurbBikeShareManagerContractInstance, setHurbBikeShareManagerContractInstance] = useState();

    const loadhHurbBikeShareManagerContractInstance = async () => {
        setHurbBikeShareManagerContractInstance(new ethers.Contract(HurbBikeShareManagerContractAddress, HurbBikeShareManager.abi, ethContext.getEthProvider().getSigner(ethContext.selectedAccount)));
    };

    const value = {
        loadhHurbBikeShareManagerContractInstance
    };

    return <HurbBikeShareManagerContext.Provider value={value}>{children}</HurbBikeShareManagerContext.Provider>;
};

export const useHurbBikeShareManagerContext = () => useContext(HurbBikeShareManagerContext);
