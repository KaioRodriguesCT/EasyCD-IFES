//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Classroom ({ classrooms }){
  return {
    title: 'Classroom',
    dataIndex: 'classroom',
    key: 'classroom',
    render: (_, record) => {
      const classroom = get(record,'classroom');
      const classroomObject = find(classrooms, { _id: classroom });
      return get(classroomObject,'name');
    }
  };
}
export default Classroom;