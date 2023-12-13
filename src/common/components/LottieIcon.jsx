/* eslint-disable react-hooks/exhaustive-deps */
import React, { } from "react";
import Lottie from 'react-lottie';
import waitingData from '../assets/lotties/waiting';
import callLoading from '../assets/lotties/call-loading.json';
import recordingData from '../assets/lotties/recording';
import loadingData from '../assets/lotties/loading';
import callingData from '../assets/lotties/calling2';
import chatData from '../assets/lotties/msg2';

const LottieIcon = (props) => {

	if (props.id === 'waiting-sm') {
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
          height={80}
          width={80}
        />
      </div>
    );
  }

	if (props.id === 'call-loading') {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: callLoading,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          height={40}
          width={40}
        />
      </div>
    );
  }

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

  if (props.id === 'chat') {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: chatData,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          width={600}
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

  if (props.id === 'calling') {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: callingData,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          height={300}
          width={300}
        />
      </div>
    );
  }

  if (props.id === 'recording') {
    return (
      <div>
        <Lottie
          options={{
            loop: true,
            autoplay: true,
            animationData: recordingData,
            rendererSettings: {
              preserveAspectRatio: "xMidYMid slice"
            }
          }}
          height={35}
          width={35}
        />
      </div>
    );
  }
};

export default LottieIcon;
