import { AppProps } from "next/app";
import "../styles/globals.scss";
import "../styles/Loading.scss";
import "../styles/App.scss";

const MyApp: React.FC<AppProps> = ({ Component, pageProps }) => {
  return <Component {...pageProps} />;
};

export default MyApp;