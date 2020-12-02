import Head from "next/head";
import { Loading, Navbar, Footer } from "../components";
import Card from "./Card";
import React from "react";

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

export default function Home() {
  return (
    <div className="App">
      {/* <Loading initializing={initializing} message={loadingMessage} /> */}
      <Navbar />
      <div className="Main-Content">
        <Card />
      </div>
      <Footer />
    </div>
  );
}
