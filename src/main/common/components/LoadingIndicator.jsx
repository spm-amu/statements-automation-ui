import React from 'react';
import { usePromiseTracker } from "react-promise-tracker";
import "./Loader.css";
import LottieIcon from "./LottieIcon";

const LoadingIndicator = (props) => {
  const { promiseInProgress } = usePromiseTracker();

  return (
    promiseInProgress &&
    <div id="myModal" className="loaderModal">
      <div style={{
        width: "100%", height: "100%", display: "flex",
        justifyContent: "center", alignItems: "center",
      }}>
        <LottieIcon id={'waiting'}/>
      </div>
    </div>
  );
};

export default LoadingIndicator;
