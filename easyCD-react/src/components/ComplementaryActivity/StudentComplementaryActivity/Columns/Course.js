import get from 'lodash/get';

function Course () {
  return {
    title:'Course',
    dataIndex: 'course.name',
    render: (_, record) => get(record, 'course.name')
  };
}
export default Course;