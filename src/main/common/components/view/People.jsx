import React, {useEffect, useState} from 'react';
import SearchBar from "../SearchBar";
import './People.css'
import PersonCard from "../PersonCard";
import {get, post} from '../../service/RestService';
import socketManager from '../../service/SocketManager';
import appManager from '../../service/AppManager'
import {MessageType} from '../../types';
import {useNavigate} from 'react-router-dom';
import Utils from "../../Utils";

const People = (props) => {

  const navigate = useNavigate();
  const [searchResult, setSearchResult] = useState({
    records: []
  });

  const {meetingId, exclusions} = props;

  useEffect(() => {
    //if (meetingId) {
    search(null, true);
    //}
  }, []);

  const search = (searchValue, searchNullValue = false) => {
    // NB : If there are exclusions(i.e people who have already joined the meeting), we call the API and pass the exclusions. We do not want to include them in the search result
    // @Nsovo - update the backend to take into account any exclusions
    // NB : If a meeting id is passed, search for all meeting attendees and pass the search value as a filter ONLY within those attendees
    // @Nsovo - update the backend to take into account any meeting attendees

    post(`${appManager.getAPIHost()}/api/v1/auth/search`, (response) => {
        console.log('RESPONSE: ', response);
        setSearchResult(response);
      }, (e) => {

      },
      {
        "parameters": [
          {
            "name": 'name',
            "value": searchValue
          },
          {
            "name": 'exclusions',
            "value": exclusions ? exclusions : null
          },
          {
            "name": 'meetingId',
            "value": meetingId ? meetingId : null
          }
        ],
        "pageSize": 2000,
        "currentPage": 0
      })
  };

  const onValueChangedHandler = (searchValue) => {
    search(searchValue);
  };

  const onAudioCallHandler = (userToCall) => {
    if (props.onAudioCallHandler) {
      props.onAudioCallHandler(userToCall);
    } else {
      alert("REQUEST TO JOIN GENERATING ID");
      get(
        `${appManager.getAPIHost()}/api/v1/meeting/generateId`,
        (response) => {
          const directCallRoom = {
            id: response
          };

          navigate("/view/meetingRoom", {
            state: {
              displayMode: 'window',
              selectedMeeting: directCallRoom,
              videoMuted: true,
              audioMuted: false,
              isDirectCall: true,
              isHost: true,
              userToCall
            }
          })
        },
        (e) => {
        },
        '',
        true
      );
    }
  };

  return (
    <div className={'w-100 h-100 people-container'}>
      <div className={'search'}>
        <SearchBar valueChangeHandler={onValueChangedHandler} onSearch={(searchValue) => {
        }}/>
      </div>
      <div className={'people-content row'} style={{maxHeight: props.meetingId ? '50%' : '77vh'}}>
        {searchResult.records.map((user, index) => {
          return <div key={index} className={'col person-card-wrapper'}
                      style={{
                        marginLeft: '0',
                        paddingLeft: '0',
                        minWidth: '320px',
                        maxWidth: '320px',
                        marginBottom: '8px'
                      }}>
            <PersonCard onAudioCallHandler={(data) => onAudioCallHandler(data)}
                        onAudioCallCancelHandler={(data) => {
                          if (!Utils.isNull(props.onAudioCallCancelHandler)) {
                            props.onAudioCallCancelHandler(data);
                          }
                        }}
                        onClosePeopleDialogHandler={() => alert('Brovovoooo')}
                        data={user}
                        avatarSize={!Utils.isNull(props.avatarSize) ? props.avatarSize : true}
                        showOnlineIndicator={!Utils.isNull(props.showOnlineIndicator) ? props.showOnlineIndicator : true}
                        inCall={!Utils.isNull(props.inCall) ? props.inCall : false}
                        chatEnabled={!Utils.isNull(props.chatEnabled) ? props.chatEnabled : true}
                        dialEnabled={!Utils.isNull(props.dialEnabled) ? props.dialEnabled : true}
            />
          </div>
        })}
      </div>
    </div>
  );
};


export default People;
