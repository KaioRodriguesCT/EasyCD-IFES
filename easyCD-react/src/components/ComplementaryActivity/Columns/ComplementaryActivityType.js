//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function ComplementaryActivityType ({ complementaryActivityTypes }) {
  return {
    title: 'Type',
    dataIndex: 'complementarActivityType',
    render: (value) => {
      const complementaryActivityType = find(complementaryActivityTypes, { _id: value });

      return get(complementaryActivityType, 'name') || '';
    }
  };
}
export default ComplementaryActivityType;
