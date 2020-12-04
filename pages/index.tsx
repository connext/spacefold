import Head from "next/head";
import { Loading, Navbar, Footer } from "../components";
import Card from "./Card";
import React, { useState, useEffect } from "react";

export default function Home() {
  const [initializing, setInitializing] = useState(true);
  const loadingMessage = "Welcome";

  useEffect(() => {
    setInitializing(false);
  }, []);

  return (
    <div className="App">
      <Head>
        <title>Spacefold</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Loading initializing={initializing} message={loadingMessage} />
      <Navbar />
      <Card />
      <Footer />
    </div>
  );
}
