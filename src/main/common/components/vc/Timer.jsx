/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import "./Timer.css"
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
import Button from '@material-ui/core/Button';
import FormControlLabel from "@material-ui/core/FormControlLabel";

const MINUTE = 60000;
const Timer = (props) => {

  const {
    time
  } = props;

  const [minutes, setMinutes] = useState();
  const [hours, setHours] = useState();
  const [extend, setExtend] = useState(false);
  const interval = useRef();

  const setupInterval = () => {
    interval.current = setInterval(function () {
      if (minutes === 0) {
        if (hours > 0) {
          setMinutes(59);
        }
      } else {
        setMinutes(minutes - 1);
      }

      if (minutes === 0 && hours > 0) {
        setHours(hours - 1);
      }

    }, MINUTE);
  };

  useEffect(() => {
    setMinutes(time % 60);
    setHours(Math.floor(time / 60));

    setupInterval();

    return () => {
      clearInterval(interval.current);
    }
  }, []);

  useEffect(() => {
    if(interval.current) {
      clearInterval(interval.current);
    }

    if(minutes === 0 && hours === 0) {
      props.onTimeLapse(extend);
    }

    setupInterval();
  }, [minutes]);

  return (
    <div
      className={'timer-container row'}
    >
      <div className={'col-*-*'}>
        {
          hours === 0 && minutes <= 5 && minutes !== 0 && !extend &&
          <div style={{
            border: '1px solid rgb(235, 63, 33)',
            width: '100%',
            borderRadius: '4px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgb(235, 63, 33)',
              padding: '8px',
              margin: '0',
              fontSize: '12px'
            }} className={'row'}>
              <div className={'row'} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0'
              }}>
                <div style={{margin: '4px'}}>
                  The meeting will end in {minutes} minute{minutes !== 1 && <>s</>}
                </div>
                <div style={{margin: '0'}} className={'col'}>
                <Button
                  variant={'contained'}
                  size="large"
                  color={'green'}
                  onClick={(e) => {
                    setExtend(true);
                  }}
                >
                  EXTEND
                </Button>
              </div>
              </div>
            </div>
          </div>
        }
      </div>
      <div style={{width: '72px'}} className={'col'}>
        {/*<div className={'row no-margin no-padding'}>
          <div className={'col no-margin no-padding'}>
            <div className={'row digit no-padding'}>
              {hours}
            </div>
            <div className={'row time-label no-margin no-padding'}>
              Hour{hours !== 1 && <>s</>}
            </div>
          </div>
          <div className={'col no-margin no-padding'}>
            <div className={'row digit no-padding'}>
              {minutes}
            </div>
            <div className={'row time-label no-margin no-padding'}>
              Minute{minutes !== 1 && <>s</>}
            </div>
          </div>
        </div>*/}
      </div>
    </div>
  );
};

export default Timer;
