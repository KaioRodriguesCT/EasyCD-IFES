//React
import React from 'react';

//Lodash
import find from 'lodash/find';
import get from 'lodash/get';

function Coordinator ({ peopleSlim }) {
  return {
    title: 'Coordinator',
    dataIndex: 'coordinator',
    render: (_, record) => {
      const coordinator = get(record, 'coordinator');
      const coordPerson = find(peopleSlim, { _id: coordinator });
      return <p>{get(coordPerson, 'name') || ''}</p>;
    }
  };
}
export default Coordinator;
