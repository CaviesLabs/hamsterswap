import "../../styles/globals.css";
import "@hamsterbox/ui-kit/dist/cjs/styles/css/main.css";
import Script from "next/script";
import makeStore from "@/src/redux";
import type { AppProps } from "next/app";
import { FC } from "react";
import { Provider } from "react-redux";
import { ThemeProvider } from "@hamsterbox/ui-kit";
import { MainProvider } from "@/src/hooks/pages/main";
import { SeoComponent } from "@/src/components/seo";
import { EvmWalletKitProvider } from "src/hooks/wagmi";
import {
  legacyLogicalPropertiesTransformer,
  StyleProvider,
} from "@ant-design/cssinjs";

/**
 * @dev Import needed third-party styled.
 */
import "flowbite";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import "@rainbow-me/rainbowkit/styles.css";

const store = makeStore();

const AppComponent: FC<{ Component: any; pageProps: any }> = ({
  Component,
  pageProps,
}) => {
  return <Component {...pageProps} />;
};

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Provider store={store}>
      <StyleProvider
        ssrInline={true}
        transformers={[legacyLogicalPropertiesTransformer]}
      >
        <SeoComponent />
        <ThemeProvider>
          {/**
           * @dev
           * NextJs recommend do only add stylesheets in SEO component
           */}
          <Script
            src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.0-beta1/dist/js/bootstrap.bundle.min.js"
            integrity="sha384-ygbV9kiqUc6oa4msXn9868pTtWMgiQaeYH7/t7LECLbyPA2x65Kgf80OJFdroafW"
            crossOrigin="anonymous"
          />
          <EvmWalletKitProvider>
            <MainProvider>
              <AppComponent {...{ Component, pageProps }} />
            </MainProvider>
          </EvmWalletKitProvider>
        </ThemeProvider>
      </StyleProvider>
    </Provider>
  );
}

export default MyApp;
