//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Student ({ people }){
  return {
    title: 'Student',
    dataIndex: 'student',
    key: 'student',
    render: (_, record) => {
      const student = get(record, 'student');
      const studentObject = find(people, { _id: student });
      return get(studentObject, 'name');
    }
  };
}
export default Student;