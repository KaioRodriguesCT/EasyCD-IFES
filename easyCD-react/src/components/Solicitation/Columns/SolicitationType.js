//Lodash
import get from 'lodash/get';
import find from 'lodash/find';

function SolicitationType ({ solicitationTypes }) {
  return {
    title: 'Type',
    dataIndex: 'solicitationType',
    render: (value) => {
      const solicitationType = find(solicitationTypes, { _id: value }) || null;
      return get(solicitationType, 'name') || '';
    }
  };
}
export default SolicitationType;
