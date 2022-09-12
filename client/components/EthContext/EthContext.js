import { createContext, useContext, useState } from "react";
import { BigNumber, ethers } from 'ethers';
import { toWei, toEther } from '../../utils/utils';
import { MAX_UINT256 } from '../../utils/constants';

export const EthContext = createContext();

const ethProviderEnabled = () => !!window.ethereum;

export const EthContextProvider = ({ children }) => {
    const [ethProvider, setEthProvider] = useState();
    const [selectedAccount, setSelectedAccount] = useState();

    const getEthProvider = () => {
        let provider = ethProvider;

        if (!provider) {
            provider = new ethers.providers.Web3Provider(window.ethereum);
            setEthProvider(provider);
        }

        return provider;
    }

    const requestAccounts = async () => {
        const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });

        setSelectedAccount(accounts[0]);

        getEthProvider().on('accountsChanged', (accounts) => setSelectedAccount(accounts[0]));
    };

    const value = {
        ethProviderEnabled,
        getEthProvider,
        requestAccounts,
        selectedAccount
    };

    return <EthContext.Provider value={value}>{children}</EthContext.Provider>;
};

export const useEthContext = () => useContext(EthContext);
