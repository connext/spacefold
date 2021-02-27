import Head from "next/head";
import { Loading, Navbar, Footer } from "../components";
import MainCard from "./MainCard";
import React, { useState, useEffect } from "react";

// 1. import `ChakraProvider` component
import { ChakraProvider } from "@chakra-ui/react"

export default function Home() {
  const [initializing, setInitializing] = useState(true);
  const loadingMessage = "Welcome";

  useEffect(() => {
    setInitializing(false);
  }, []);

  return (
    <div className="App">
      <ChakraProvider>
        <Head>
          <title>Spacefold</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <Loading initializing={initializing} message={loadingMessage} />
        <Navbar />
        <MainCard/>
        <Footer />
      </ChakraProvider>
    </div>
  );
}
