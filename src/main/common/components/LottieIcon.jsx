/* eslint-disable react-hooks/exhaustive-deps */
import React, { } from "react";
import Lottie from 'react-lottie';
import waitingData from '../assets/lotties/waiting';
import loadingData from '../assets/lotties/loading';

const Lobby = (props) => {

	if (props.id === 'waiting') {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: waitingData,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          height={200}
          width={200}
        />
      </div>
    );
  }

  if (props.id === 'loading') {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: loadingData,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          height={100}
          width={100}
        />
      </div>
    );
  }
};

export default Lobby;
