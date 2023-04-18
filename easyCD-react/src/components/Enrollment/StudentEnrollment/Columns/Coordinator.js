import get from 'lodash/get';

function Coordinator (){
  return {
    title: 'Coordinator',
    dataIndex:'coordinator.name',
    render: (_,record) => get(record, 'coordinator.name')
  };
}
export default Coordinator;