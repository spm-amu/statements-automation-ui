import React, {useEffect, useState} from 'react';
import "./ActivityCard.css"
import HTMLRenderer from "react-html-renderer";
import Icon from "../Icon";

const ActivityCardComponent = React.memo(React.forwardRef((props, ref) => {

  const {activity, selected} = props;
  const [read, setRead] = useState(props.activity.read);

  useEffect(() => {
  }, []);

  useEffect(() => {
    return () => {
    };
  }, []);

  const resolveIcon = (activityType) => {
    switch (activityType) {
      case 'START_CALL':
        return <Icon id={'CALL'}/>;
      case 'REJECT_CALL':
        return <Icon id={'CANCEL'}/>;
      case 'MISSED_CALL':
      case 'UN_ANSWERED_CALL':
        return <Icon id={'CALL_MISSED'}/>;
      case 'END_CALL':
        return <Icon id={'CALL_END'}/>;
      case 'ANSWER_CALL':
        return <Icon id={'CALL_RECEIVED'}/>;
    }

    return null;
  };

  return (
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
              {new Date(activity.createdDate).toLocaleString('en-US', {
                hour12: true,
                hour: 'numeric',
                minute: 'numeric',
              })}
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
        </div>
        {
          activity.vcActivityTitle &&
          <div className={'row'} style={{fontWeight: 500}}>
            {
              activity.vcActivityTitle
            }
          </div>
        }
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
