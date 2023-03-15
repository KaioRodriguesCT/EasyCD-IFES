//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Student ({ students }) {
  return {
    title: 'Student',
    dataIndex: 'student',
    render: (value) => {
      const student = find(students, { _id: value });
      return get(student, 'name') || '';
    }
  };
}
export default Student;
