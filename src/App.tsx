import React, { useState, useEffect } from "react";
import { Loading, Navbar, Footer } from "./components";
import { Modal } from "./components";
import "./styles/globals.scss";
import "./App.css";

function App() {
  const [initializing, setInitializing] = useState(true);
  const loadingMessage = "Welcome";

  useEffect(() => {
    setInitializing(false);
  }, []);

  return (
    <div className="App">
      <Loading initializing={initializing} message={loadingMessage} />
      <Navbar />
      <div className="home">
        <div id="card" className="card p-8">
          <Modal />
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
