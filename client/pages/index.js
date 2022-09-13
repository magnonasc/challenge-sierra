import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";
import { useState, useEffect } from "react";
import { BigNumber, ethers } from "ethers";
import { toWei } from '../utils/utils';
import { useEthContext } from "../components/EthContext/EthContext";
import { useHRBTokenContext } from '../components/HRBTokenContext/HRBTokenContext';
import { useHRBTokenCrowdsaleContext } from '../components/HRBTokenCrowdsaleContext/HRBTokenCrowdsaleContext';
import { useHurbBikeShareManagerContext } from '../components/HurbBikeShareManagerContext/HurbBikeShareManagerContext';

const Home = () => {
    const ethContext = useEthContext();
    const hrbTokenContext = useHRBTokenContext();
    const hrbTokenCrowdsaleContext = useHRBTokenCrowdsaleContext();
    const hurbBikeShareManagerContext = useHurbBikeShareManagerContext();

    const handleBuyHRBTokens = async () => {
        await hrbTokenCrowdsaleContext.buyHRBTokens('662');
    };

    const handleApproveHurbBikeShareManagerContract = async () => {
        await hrbTokenContext.approveHurbBikeShareManagerContract();
    };

    useEffect(() => {
        (async () => await ethContext.requestAccounts())();
    }, []);

    useEffect(() => {
        (async () => await hrbTokenContext.loadHRBTokenContractInstance())();
        (async () => await hrbTokenCrowdsaleContext.loadHRBTokenCrowdsaleContractInstance())();
        (async () => await hurbBikeShareManagerContext.loadhHurbBikeShareManagerContractInstance())();
    }, [ethContext.selectedAccount]);

    useEffect(() => {
        (async () => await hrbTokenContext.loadHRBTokenBalance())();
    }, [ethContext.selectedAccount]);

    useEffect(() => {
        (async () => await hrbTokenCrowdsaleContext.loadHRBTokenETHRate())();
    }, [ethContext.selectedAccount]);

    useEffect(() => {
        (async () => await hrbTokenContext.checkHurbBikeShareManagerContractApproval())();
    }, [ethContext.selectedAccount]);

    return (
        <div className={styles.container}>
            <Head>
                <title>Create Next App</title>
                <meta
                    name="description"
                    content="Generated by create next app"
                />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <p>Você tem {hrbTokenContext.hrbTokenBalance ? ethers.utils.formatEther(hrbTokenContext.hrbTokenBalance) : 0} HRB Tokens!</p>
                <p>A taxa atual do HRB Token é de 1 ETH para {hrbTokenCrowdsaleContext.hrbTokenETHRate || 0} HRBs</p>
                {!hrbTokenContext.isHurbBikeShareManagerContractApproved && (<button onClick={handleApproveHurbBikeShareManagerContract}>Aprovar contrato para alugar uma Hurb Bike</button>)}
                <button onClick={handleBuyHRBTokens}>Comprar 662 HRB Tokens</button>
            </main>

            <footer className={styles.footer}></footer>
        </div>
    );
};

export default Home;