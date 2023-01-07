import React, {useEffect, useState} from 'react';
import "./ActivityCard.css"
import HTMLRenderer from "react-html-renderer";
import Icon from "../Icon";
import moment from 'moment';

const ActivityCardComponent = React.memo(React.forwardRef((props, ref) => {

  const {activity, selected} = props;
  const [read, setRead] = useState(props.activity.read);
  const [time, setTime] = useState("");

  useEffect(() => {
    let createdDate = moment(activity.createdDate.split('.')[0]);
    let now = moment(new Date());

    if(!activity.description) {
      activity.description = "";
    }

    if(now.year() === createdDate.year() && now.month() === createdDate.month() && now.day() === createdDate.day()) {
      setTime(createdDate.format('HH:mm'));
    } else if(now.year() === createdDate.year() && (now.month() !== createdDate.month() || now.day() !== createdDate.day())) {
      setTime(createdDate.format('DD/MM, HH:mm'));
    } else {
      setTime(createdDate.format('YY/DD/MM, HH:mm'))
    }

    console.log()
  }, []);

  useEffect(() => {
    return () => {
    };
  }, []);

  const resolveIcon = (activityType) => {
    switch (activityType) {
      case 'START_CHAT':
        return <Icon id={'CHAT_BUBBLE'}/>;
      case 'START_CALL':
        return <Icon id={'CALL'}/>;
      case 'REJECT_CALL':
        return <Icon id={'CANCEL'}/>;
      case 'START_MEETING':
      case 'JOIN_MEETING':
        return <Icon id={'VIDEOCAM'}/>;
      case 'MISSED_CALL':
      case 'UN_ANSWERED_CALL':
        return <Icon id={'CALL_MISSED'}/>;
      case 'END_MEETING':
        return <Icon id={'VIDEOCAM_OFF'}/>;
      case 'END_CALL':
        return <Icon id={'CALL_END'}/>;
      case 'ANSWER_CALL':
        return <Icon id={'CALL_RECEIVED'}/>;
    }

    return null;
  };

  return (
    activity && activity.description &&
    <div className={activity.rootEvent ? 'activity-card-wrapper-root' : activity.description.includes('<@u>You</@u>') ? 'activity-card-wrapper-child self' : 'activity-card-wrapper-child'}>
      <div
        className={selected && (selected.id === activity.id) ? 'activity-card-selected' : read ? 'activity-card' : 'activity-card-unread'}
        onClick={() => {
          setRead(true);

          // TODO : Call rest to read item at the back-end
          props.selectionHandler(activity);
        }}>
        <div style={{height: '32px'}}>
          <div className={'time'} style={{fontSize: '16px'}}>
            <div
              style={{
                position: 'absolute',
                fontSize: 'auto',
                marginBottom: '0'
              }}
            >
              <span>{time}</span>
            </div>
          </div>
        </div>
        <div style={{fontWeight: 400}}>
          <div className={'row'} style={{marginLeft: '0px', marginRight: '0px'}}>
            <div style={{width: '32px'}}>
              {
                resolveIcon(activity.type)
              }
            </div>
            <div className={'col'} style={{paddingLeft: '0px', paddingRight: '0px'}}>
              <HTMLRenderer
                html={activity.description.replace('<@u>You</@u>', 'You').replace('<@u>', '<span style="font-weight: 600">').replace('</@u>', '</span>')}/>
            </div>
          </div>
          {
            activity.vcActivityTitle &&
            <div className={'row'} style={{fontWeight: 600, marginLeft: '0px', marginRight: '0px'}}>
              {
                activity.vcActivityTitle
              }
            </div>
          }
        </div>
      </div>
    </div>
  );
}));

const ActivityCard = React.memo(React.forwardRef((props, ref) => {
  return (
    <ActivityCardComponent
      ref={ref}
      {...props}
    >
    </ActivityCardComponent>
  );
}));

export default ActivityCard;
