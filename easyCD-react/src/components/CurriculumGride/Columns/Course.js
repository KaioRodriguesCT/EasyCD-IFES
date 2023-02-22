//React
import React from 'react';

//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Course ({ courses }){
  return {
    title:'Course',
    dataIndex:'course',
    render: (_, record) => {
      const course = get(record, 'course');
      const courseObj = find(courses,{ _id: course });
      return <p>{get(courseObj,'name') || ''}</p>;
    }
  };
}
export default Course;