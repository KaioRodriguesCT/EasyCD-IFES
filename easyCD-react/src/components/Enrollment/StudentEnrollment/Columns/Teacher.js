import get from 'lodash/get';

function Teacher (){
  return {
    title: 'Teacher',
    dataIndex:'teacher.name',
    render: (_,record) => get(record, 'teacher.name')
  };
}
export default Teacher;