import React, {useEffect, useState} from 'react';
import './ActivityList.css';
import {host, post} from "../../service/RestService";
import ActivityCard from "./ActivityCard";

const ActivityList = (props) => {

  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [selected, setSelected] = useState(null);
  const {
    rootEvent
  } = props;

  const loadActivities = () => {
    post(`${host}/api/v1/activity/fetch`, (response) => {
        console.log("\n\n\n\nRES : ", response);
        setLoading(false);
        setActivities(response.records);
      }, (e) => {
      },
      {
        "pageSize": 2000,
        "currentPage": 0
      })
  };

  useEffect(() => {
    if (!rootEvent) {
      loadActivities();
    }
  }, []);

  return (
    !loading &&
    <div className="activities">
      {activities
        .map((activity, index) => {
          return <ActivityCard key={index} activity={activity} selected={selected}
                               selectionHandler={(selected) => setSelected(selected)}/>;
        })}
    </div>
  );
};

export default ActivityList;
