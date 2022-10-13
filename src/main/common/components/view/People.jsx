import React, {useState} from 'react';
import SearchBar from "../SearchBar";
import './People.css'
import MeetingParticipant from "../vc/MeetingParticipantGrid";
import PersonCard from "../PersonCard";

const People = (props) => {

  const [searchResult, setSearchReult] = useState({
    records: [
      {
        name: 'Nsovo Ngobeni',
        avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
        email: 'nsovo@gmail.com'
      },
      {
        name: 'Peter Miyambo',
        avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
        email: 'peter@gmail.com'
      },
      {
        name: 'Frank Shandlale',
        avatar: require('../../../desktop/dashboard/images/noimage-person.png'),
        email: 'frank@gmail.com'
      }
    ]
  });


  return (
    <div className={'w-100 h-100 people-container'}>
      <div className={'search'}>
        <SearchBar onSearch={(searchValue) => alert('SEARCHING WITH VAL : ' + searchValue)}/>
      </div>
      <div className={'people-content row'}>
        {searchResult.records.map((user, index) => {
          return <div key={index} className={'col'} style={{marginLeft: '0', paddingLeft: '0', maxWidth: '400px'}}>
              <PersonCard data={user}/>
          </div>
        })}
      </div>
    </div>
  );
};


export default People;
