import React from 'react';
import './TalkerCard.css';
import {PhoneInTalk} from '@material-ui/icons';

const TalkerCard = (props) => {
  return (
    <div
      className={'talker-card'}
    >
      <div className="row">
        <div style={{width: '32px'}}>
          <PhoneInTalk/>
        </div>
        <div className="no-margin">
          {
            props.data.name
          }
        </div>
      </div>
    </div>
  );
};

export default TalkerCard;
