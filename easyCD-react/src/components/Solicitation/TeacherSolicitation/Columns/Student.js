import get from 'lodash/get';

function Student (){
  return {
    title: 'Student',
    dataIndex: 'student.name',
    render: (_, record) => get(record, 'student.name') || ''

  };
}
export default Student;