//Lodash
import  find from 'lodash/find';
import get from 'lodash/get';

function Course ({ courses }){
  return {
    title:'Course',
    dataIndex: 'course',
    render: (value) => {
      const course = find(courses, { _id: value });
      return get(course,'name') || '';
    }
  };
}
export default Course;