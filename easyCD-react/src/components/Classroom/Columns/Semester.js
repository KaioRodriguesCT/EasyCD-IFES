import get from 'lodash/get';

function Semester ({ dataIndex = 'semester' } = { dataIndex: 'semester' }){
  return {
    title:'Semester',
    dataIndex,
    key:'semester',
    render: (_, record) => get(record, dataIndex)
  };
}
export default Semester;