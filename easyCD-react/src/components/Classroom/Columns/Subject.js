//React
import React from'react';

//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Subject ({ subjects }){
  return {
    title:'Subject',
    dataIndex: 'subject',
    key:'subject',
    render: (_, record) => {
      const subject = get(record, 'subject');
      const subjectObject = find(subjects, { _id: subject });

      return (
        <span>{get(subjectObject, 'name')}</span>
      );
    }
  };
}
export default Subject;