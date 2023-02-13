/* eslint-disable react-hooks/exhaustive-deps */
import React, {useEffect, useRef, useState} from "react";
import "./Timer.css"
import FormControl from "@material-ui/core/FormControl";
import RadioGroup from "@material-ui/core/RadioGroup";
import Radio from "@material-ui/core/Radio";
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
      <div style={
        {
          width: 'calc(100% - 160px)'
        }
      } className={'col-*-*'}>
        {
          hours === 0 && minutes <= 5 && minutes !== 0 &&
          <div style={{
            border: '1px solid rgb(235, 63, 33)',
            width: '100%',
            borderRadius: '4px',
            paddingTop: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgb(235, 63, 33)',
              marginLeft: '32px',
              marginRight: '32px',
              fontSize: '12px'
            }} className={'row'}>
              <div className={'row'}>
                There {minutes === 1 ? <>is</> : <>are</>} {minutes} minute{minutes !== 1 && <>s</>} remaining. Do you want to automatically extend the meeting?
              </div>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgb(235, 63, 33)'
            }} className={'row'}>
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-radio-buttons-group-label"
                  row
                  defaultValue={'NO'}
                  name="radio-buttons-group"
                  onChange={(e, val) => {
                    setExtend(val === 'YES');
                  }}
                >
                  <FormControlLabel
                    value="YES"
                    control={<Radio/>}
                    label="Yes"
                  />
                  <FormControlLabel
                    value="NO"
                    control={<Radio/>}
                    label="No"
                  />
                </RadioGroup>
              </FormControl>
            </div>
          </div>
        }
      </div>
      <div style={{width: '72px'}} className={'col'}>
        <div className={'row no-margin no-padding'}>
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
        </div>
      </div>
    </div>
  );
};

export default Timer;
