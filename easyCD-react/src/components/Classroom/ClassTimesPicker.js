//React
import React, { useEffect, useState } from 'react';

//Antd
import { Button, DatePicker, Select, Space } from 'antd';
import { DeleteOutlined, PlusCircleOutlined } from '@ant-design/icons';

//Lodash
import clone from 'lodash/clone';
import map from 'lodash/map';

import moment from 'moment';

function ClassTimesPicker ({ defaultValue, onChange }) {
  const [classTimes, setClassTimes] = useState(defaultValue);

  //Handlers
  const addClassTime = () => {
    const actualClassTimes = clone(classTimes) || [];
    actualClassTimes.push({ day: null, start: null, end: null });
    setClassTimes(actualClassTimes);
  };

  const removeClasstime = (index) => {
    const actualClassTimes = clone(classTimes) || [];
    actualClassTimes.splice(index, 1);
    setClassTimes(actualClassTimes);
  };

  const onChangeDay = (index) => (day) => {
    const actualClassTimes = clone(classTimes) || [];
    actualClassTimes[ index ].day = day;
    setClassTimes(actualClassTimes);
  };

  const onChangeStartOrEnd = (field, index) => (time) => {
    const actualClassTimes = clone(classTimes) || [];
    actualClassTimes[ index ][ field ] = time ? time.format('HH:mm') : null;
    setClassTimes(actualClassTimes);
  };

  //Hooks
  useEffect(() => {
    onChange(classTimes);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [classTimes]);

  //Renders
  const renderClassTime = () => {
    return map(classTimes, (classTime, index) => {
      return (
        <Space direction="horizontal">
          <Select
            options={[
              'Sunday',
              'Monday',
              'Tuesday',
              'Wednesday',
              'Thursday',
              'Friday',
              'Saturday'
            ].map((weekday, index) => ({
              label: weekday,
              value: index
            }))}
            style={{ minWidth: '150px' }}
            value={classTime.day}
            onChange={onChangeDay(index)}
          />
          <DatePicker.TimePicker
            placeholder="Start"
            showSecond={false}
            defaultValue={classTime.start ? moment(classTime.start, 'HH:mm') : null}
            onChange={onChangeStartOrEnd('start', index)}
          />
          <DatePicker.TimePicker
            placeholder="End"
            showSecond={false}
            defaultValue={classTime.end ? moment(classTime.end, 'HH:mm') : null}
            onChange={onChangeStartOrEnd('end', index)}
          />
          <Button icon={<DeleteOutlined/>} type="primary" danger onClick={() => removeClasstime(index)}/>
        </Space>
      );
    });
  };

  return (
    <Space direction="vertical" size="large">
      {renderClassTime()}
      <Button icon={<PlusCircleOutlined />} type="primary" onClick={addClassTime} />
    </Space>
  );
}
export default ClassTimesPicker;
