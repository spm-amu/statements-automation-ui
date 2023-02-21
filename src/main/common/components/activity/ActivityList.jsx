import React, {useEffect, useState} from 'react';
import './ActivityList.css';
import {get, post} from "../../service/RestService";
import ActivityCard from "./ActivityCard";
import appManager from '../../service/AppManager'

const ActivityList = (props) => {

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const {
    rootEvent
  } = props;

  const loadActivities = () => {
    post(`${appManager.getAPIHost()}/api/v1/activity/fetch`, (response) => {
        setLoading(false);
        setActivities(response.records);
      }, (e) => {
      },
      {
        "parameters": [
          {
            "name": 'correlationId',
            "value": rootEvent ? rootEvent.correlationId : null
          }
        ],
        "pageSize": 2000,
        "currentPage": 0
      })
  };

  const handleSelection = (selected) => {
    if (!selected.read) {
      get(`${appManager.getAPIHost()}/api/v1/activity/read/${selected.id}`, () => {
        selected.read = true;
        setSelected(selected);

        if (props.selectionHandler) {
          props.selectionHandler(selected);
        }
      }, (e) => {
      })
    } else {
      setSelected(selected);
      if (props.selectionHandler) {
        props.selectionHandler(selected);
      }
    }
  };

  useEffect(() => {
    loadActivities();
  }, []);

  useEffect(() => {
    loadActivities();
  }, [rootEvent]);

  return (
    !loading &&
    <div className="activities">
      {activities
        .map((activity, index) => {
          return <ActivityCard key={index} activity={activity} selected={selected}
                               selectionHandler={(selected) => handleSelection(selected)}/>;
        })}
    </div>
  );
};

export default ActivityList;
