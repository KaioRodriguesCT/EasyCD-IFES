//React
import React from 'react';

//Antd
import { Tag } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

import moment from 'moment';

function ClassTimes ({ dataIndex = 'classTimes' } = { dataIndex: 'classTimes' }){
  return {
    title:'Class Times',
    dataIndex,
    key:'classTimes',
    render: (_, record) => {
      const classTimes = get(record, dataIndex);
      return (
        <>
          {map(classTimes, (classTime) => {
            const weekDay = moment().weekday(get(classTime, 'day'))
              .format('dddd');
            return (
              <Tag>
                {weekDay} | {classTime.start} - {classTime.end}
              </Tag>
            );
          })}
        </>
      );

    }
  };
}
export default ClassTimes;