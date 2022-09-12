import { EthContextProvider } from '../components/EthContext/EthContext';
import { HRBTokenContextProvider } from '../components/HRBTokenContext/HRBTokenContext';
import { HRBTokenCrowdsaleContextProvider } from '../components/HRBTokenCrowdsaleContext/HRBTokenCrowdsaleContext';
import { HurbBikeShareManagerContextProvider } from '../components/HurbBikeShareManagerContext/HurbBikeShareManagerContext';
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
    return (
        <EthContextProvider>
            <HRBTokenContextProvider>
                <HRBTokenCrowdsaleContextProvider>
                    <HurbBikeShareManagerContextProvider>
                        <Component {...pageProps} />
                    </HurbBikeShareManagerContextProvider>
                </HRBTokenCrowdsaleContextProvider>
            </HRBTokenContextProvider>
        </EthContextProvider>
    );
}

export default MyApp
