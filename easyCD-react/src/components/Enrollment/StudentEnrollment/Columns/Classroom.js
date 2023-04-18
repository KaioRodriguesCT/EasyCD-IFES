import get from 'lodash/get';

function Classroom () {
  return {
    title: 'Classroom',
    dataIndex: 'classroom.name',
    render: (_,record) => get(record,'classroom.name')
  };
}
export default Classroom;