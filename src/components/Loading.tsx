import React, { FC, useState } from "react";
import { IMAGE_PATH } from "../constants";

interface LoadingProps {
  initializing: Boolean;
  message: string;
}
const Loading: FC<LoadingProps> = (props) => {
  const { initializing, message } = props;
  const [imageLoaded, setImageLoaded] = useState(true);
  return (
    <div className={initializing ? "Loading" : "Loading Loading-fadeout"}>
      <div
        className="Loading-Circle"
        style={{ display: imageLoaded ? "block" : "none" }}
      >
        <img
          src={IMAGE_PATH.gifs.loading}
          alt="loading"
          width={96}
          height={96}
          onLoad={() => setImageLoaded(false)}
        />
      </div>
      <div className="Loading-Message">{message}</div>
    </div>
  );
};

export default Loading;
