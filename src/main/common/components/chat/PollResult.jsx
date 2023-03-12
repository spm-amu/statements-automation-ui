import React, { useEffect, useState } from 'react';
import './ChatRooms.scss';
import { CheckCircle } from '@material-ui/icons';

const PollResult = (props) => {
  return (
    <div className="cv-poll-choice">
      <span className="cv-poll-choice-details">
        <span className="cv-choice-percentage">
            {!props.percentVote ? '0' : Math.round(props.percentVote * 100) / 100}%
        </span>
        <span className="cv-choice-text">
            { props.option.text }
        </span>
        {
          props.isSelected ? (
            <CheckCircle
              className="selected-choice-icon"
            />
          ): null
        }
      </span>
      <span className={props.isWinner ? 'cv-choice-percent-chart winner': 'cv-choice-percent-chart'}
        style={{width: !props.percentVote ? '0%' : props.percentVote + '%' }}>
      </span>
    </div>
  )
};


export default PollResult;
