import get from 'lodash/get';

function Axle () {
  return {
    title:'Axle',
    dataIndex: 'type.axle',
    render: (_, record) => get(record, 'type.axle')
  };
}
export default Axle;