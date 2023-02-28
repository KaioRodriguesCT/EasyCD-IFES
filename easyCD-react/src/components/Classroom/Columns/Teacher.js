//React
import React from'react';

//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Teacher ({ peopleSlim }){
  return {
    title:'Teacher',
    dataIndex: 'teacher',
    key:'teacher',
    render: (_, record) => {
      const teacher = get(record, 'teacher');
      const teacherObj = find(peopleSlim, { _id: teacher });
      return (<span>{get(teacherObj, 'name')}</span>);
    }
  };
}
export default Teacher;