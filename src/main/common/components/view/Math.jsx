import React, {useState} from 'react';
import appManager from "../../service/AppManager";
import {get} from "../../service/RestService";

const Math = (props) => {

  const [a] = useState(2);
  const [b] = useState(32);
  const [sum, setSum] = useState(0);

  React.useEffect(() => {
    get(
      `${appManager.getAPIHost()}/api/v1/math/sum?a=${a}&b=${b}`,
      (response) => {
        setSum(response);
      },
      (e) => {
      }
    );
  }, []);

  return <>
    <div style={{fontSize: '24px', color: 'red', padding: '64px'}}>
      Hello. I am your arithmetic Guru.
      {
        ` I have added ${a} and ${b} and the sum is ${sum}`
      }
    </div>
  </>
};

export default Math;
