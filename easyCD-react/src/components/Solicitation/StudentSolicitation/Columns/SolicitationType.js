import get from 'lodash/get';

function SolicitationType (){
  return {
    title:'S. Type',
    dataIndex: 'type.name',
    render: (_, record) => get(record, 'type.name')
  };
}

export default SolicitationType;