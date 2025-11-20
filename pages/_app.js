import "../styles/globals.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../config/wagmi";
import "@rainbow-me/rainbowkit/styles.css";
import { Toaster } from "react-hot-toast";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          modalSize="compact"
          theme={{
            lightMode: {
              colors: {
                accentColor: '#7b3ff2',
                accentColorForeground: 'white',
                actionButtonBorder: 'rgba(0, 0, 0, 0.04)',
                actionButtonBorderMobile: 'rgba(0, 0, 0, 0.06)',
                actionButtonSecondaryBackground: 'rgba(0, 0, 0, 0.06)',
                closeButton: 'rgba(60, 66, 66, 0.8)',
                closeButtonBackground: 'rgba(0, 0, 0, 0.06)',
                connectButtonBackground: '#fff',
                connectButtonBackgroundError: '#FF494A',
                connectButtonInnerBackground: 'linear-gradient(0deg, rgba(0, 0, 0, 0.03), rgba(0, 0, 0, 0.06))',
                connectButtonText: '#25292E',
                connectButtonTextError: '#fff',
                connectionIndicator: '#30E000',
                downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(171, 171, 171, 0.04) 71.04%), #FFFFFF',
                downloadTopCardBackground: 'linear-gradient(126deg, rgba(171, 171, 171, 0.2) 9.49%, rgba(255, 255, 255, 0) 71.04%), #FFFFFF',
                error: '#FF494A',
                generalBorder: 'rgba(0, 0, 0, 0.06)',
                generalBorderDim: 'rgba(0, 0, 0, 0.03)',
                menuItemBackground: 'rgba(60, 66, 66, 0.1)',
                modalBackdrop: 'rgba(0, 0, 0, 0.3)',
                modalBackground: '#fff',
                modalBorder: 'transparent',
                modalText: '#25292E',
                modalTextDim: 'rgba(60, 66, 66, 0.3)',
                modalTextSecondary: 'rgba(60, 66, 66, 0.6)',
                profileAction: '#fff',
                profileActionHover: 'rgba(255, 255, 255, 0.5)',
                profileForeground: 'rgba(60, 66, 66, 0.06)',
                selectedOptionBorder: 'rgba(60, 66, 66, 0.1)',
                standby: '#FFD641',
              },
            },
            darkMode: {
              colors: {
                accentColor: '#7b3ff2',
                accentColorForeground: 'white',
                actionButtonBorder: 'rgba(255, 255, 255, 0.04)',
                actionButtonBorderMobile: 'rgba(255, 255, 255, 0.08)',
                actionButtonSecondaryBackground: 'rgba(255, 255, 255, 0.08)',
                closeButton: 'rgba(224, 232, 255, 0.6)',
                closeButtonBackground: 'rgba(255, 255, 255, 0.08)',
                connectButtonBackground: '#1A1B1F',
                connectButtonBackgroundError: '#FF494A',
                connectButtonInnerBackground: 'linear-gradient(0deg, rgba(255, 255, 255, 0.075), rgba(255, 255, 255, 0.15))',
                connectButtonText: '#fff',
                connectButtonTextError: '#fff',
                connectionIndicator: '#30E000',
                downloadBottomCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0) 9.49%, rgba(255, 255, 255, 0.05) 71.04%), #1A1B1F',
                downloadTopCardBackground: 'linear-gradient(126deg, rgba(255, 255, 255, 0.1) 9.49%, rgba(255, 255, 255, 0) 71.04%), #1A1B1F',
                error: '#FF494A',
                generalBorder: 'rgba(255, 255, 255, 0.08)',
                generalBorderDim: 'rgba(255, 255, 255, 0.04)',
                menuItemBackground: 'rgba(224, 232, 255, 0.1)',
                modalBackdrop: 'rgba(0, 0, 0, 0.5)',
                modalBackground: '#1A1B1F',
                modalBorder: 'rgba(255, 255, 255, 0.08)',
                modalText: '#fff',
                modalTextDim: 'rgba(224, 232, 255, 0.3)',
                modalTextSecondary: 'rgba(255, 255, 255, 0.6)',
                profileAction: 'rgba(224, 232, 255, 0.1)',
                profileActionHover: 'rgba(224, 232, 255, 0.2)',
                profileForeground: 'rgba(224, 232, 255, 0.05)',
                selectedOptionBorder: 'rgba(224, 232, 255, 0.1)',
                standby: '#FFD641',
              },
            },
          }}
        >
          <Component {...pageProps} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10B981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 4000,
                iconTheme: {
                  primary: '#EF4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;
