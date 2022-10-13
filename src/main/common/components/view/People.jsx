import React, {useState} from 'react';
import SearchBar from "../SearchBar";
import './People.css'
import PersonCard from "../PersonCard";
import { host, post } from '../../service/RestService';

const People = (props) => {

  const [searchResult, setSearchResult] = useState({
    records: []
  });

  const onValueChangedHandler = (searchValue) => {
    if (searchValue) {
      post(`${host}/api/v1/auth/search`, (response) => {
          console.log('RESPONSE: ', response);
          setSearchResult(response);
        }, (e) => {

        },
        {
          "parameters": [
            {
              "name": 'emailAddress',
              "value": searchValue
            }
          ],
          "pageSize": 2000,
          "currentPage": 0
        })
    } else {
      setSearchResult({
        records: []
      });
    }
  }

  return (
    <div className={'w-100 h-100 people-container'}>
      <div className={'search'}>
        <SearchBar valueChangeHandler={onValueChangedHandler} onSearch={(searchValue) => {}}/>
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
