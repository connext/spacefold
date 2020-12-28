import React, { FC } from 'react';
import './style.module.scss';
// @ts-ignore
import LoadingGif from '../../assets/loading.gif';

interface LoadingProps {
  initializing: boolean;
  message: string;
}

const Loading: FC<LoadingProps> = props => {
  //   const [imageLoaded, setImageLoaded] = useState(true);
  return (
    <div className={props.initializing ? 'Loading' : 'Loading Loading-fadeout'}>
      <div
        className="Loading-Circle"
        // style={{ display: imageLoaded ? "block" : "none" }}
      >
        <img src={LoadingGif} alt="loading"></img>
      </div>
      <div className="Loading-Message">{props.message}</div>
    </div>
  );
};

export default Loading;
