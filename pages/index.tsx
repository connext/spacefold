import Head from "next/head";
import { Loading, Navbar, Footer } from "./components";
import Card from "./Card";
import LeftCard from "./LeftCard";
import RigthCard from "./RightCard";
import Fold from "./Fold";
import React, { useState, useEffect, useRef } from "react";
import Connext from "./service/connext";

// if (typeof window !== "undefined") {
//   if (
//     !window.localStorage.getItem("VERSION") ||
//     window.localStorage.getItem("VERSION") !== LOCAL_STORAGE_VERSION
//   ) {
//     window.localStorage.clear();
//     window.localStorage.setItem("VERSION", LOCAL_STORAGE_VERSION);
//     window.location.reload();
//   }
// }

// const getTweetURL = (publicIdentifier, chainName, tokenName) =>
//   "https://twitter.com/intent/tweet?text=" +
//   encodeURIComponent(
//     `Minting ${tokenName} tokens for channel ${publicIdentifier} https://spacefold.io on ${chainName}! By @ConnextNetwork`
//   );

export default function Home() {
  const [leftSelectHeight, setLeftSelectHeight] = useState(0);
  const [rightSelectHeight, setRightSelectHeight] = useState(0);
  const leftCardRef = useRef(null);
  const rightCardRef = useRef(null);

  if (process.browser) {
    const connextNode = new Connext();
    connextNode.connectMetamask();
  }


  // window resize setup
  useEffect(() => {
    function changeSelectHeight() {
      setLeftSelectHeight(
        leftCardRef.current ? leftCardRef.current.clientHeight : 0
      );
      setRightSelectHeight(
        rightCardRef.current ? rightCardRef.current.clientHeight : 0
      );
    }
    changeSelectHeight();
    window.addEventListener("resize", changeSelectHeight);
    return () => window.removeEventListener("resize", changeSelectHeight);
  }, []);

  return (
    <div className="App">
      {/* <Loading initializing={initializing} message={loadingMessage} /> */}
      <Navbar />
      <div className="Main-Content">
        <Card/>
        {/* <LeftCard /> */}
        {/* <Fold /> */}
        {/* <RightCard /> */}
      </div>
      <Footer />
    </div>
  );
}
