import get from 'lodash/get';

function TotalScore () {
  return {
    title:'P. Total',
    dataIndex: 'p_total',
    render: (_, record) => get(record, 'quantity', 0 ) * get(record, 'type.score', 0)
  };
}
export default TotalScore;