import React, { useState } from "react";

import loadingGif from "../images/loading.gif";
import "./Loading.css";

export default function Loading({ initializing }) {
  const [imageLoaded, setImageLoaded] = useState(false);
  return <div className={initializing ? "Loading" : "Loading Loading-fadeout"}>
    <div className="Loading-Circle" style={{display: imageLoaded ? 'block' : 'none'}}>
      <img src={loadingGif} alt="loading" onLoad={() => setImageLoaded(true)} />
    </div>
  </div>;
};
