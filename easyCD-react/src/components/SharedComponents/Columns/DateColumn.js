//React
import React from 'react';

//Lodash
import get from 'lodash/get';

//Moment
import moment from 'moment/moment';

function DateColumn ({ title, dataIndex }) {
  return {
    title,
    dataIndex,
    render: (_, record) => {
      return <>{moment(get(record, dataIndex)).format('YYYY/MM/DD')}</>;
    }
  };
}
export default DateColumn;
