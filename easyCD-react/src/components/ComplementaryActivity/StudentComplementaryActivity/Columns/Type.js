import get from 'lodash/get';

function Type () {
  return {
    title:'CA. Type',
    dataIndex: 'type.name',
    render: (_, record) => get(record, 'type.name')
  };
}
export default Type;