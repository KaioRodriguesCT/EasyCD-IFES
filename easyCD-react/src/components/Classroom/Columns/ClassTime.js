//React
import React from 'react';

//Antd
import { Tag } from 'antd';

//Lodash
import get from 'lodash/get';
import map from 'lodash/map';

import moment from 'moment';

function ClassTimes (){
  return {
    title:'Class Times',
    dataIndex: 'classTimes',
    key:'classTimes',
    render: (_, record) => {
      const classTimes = get(record,'classTimes');
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