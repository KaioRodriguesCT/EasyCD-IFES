//Lodash
import get from 'lodash/get';
import find from 'lodash/find';

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
