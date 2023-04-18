import get from 'lodash/get';

function Score () {
  return {
    title:'Score',
    dataIndex: 'type.score',
    render: (_, record) => get(record, 'type.score')
  };
}
export default Score;