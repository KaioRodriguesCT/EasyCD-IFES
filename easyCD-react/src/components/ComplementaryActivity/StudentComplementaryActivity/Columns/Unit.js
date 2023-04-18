import get from 'lodash/get';

function Unit () {
  return {
    title:'Unit',
    dataIndex: 'type.unit',
    render: (_, record) => get(record, 'type.unit')
  };
}
export default Unit;