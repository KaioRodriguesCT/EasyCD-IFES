import { SearchOutlined } from '@ant-design/icons';
import { Button, Input } from 'antd';
import get from 'lodash/get';
import { useState } from 'react';

function InputFilter ({ defaultValue, onChange, placeholder, allowClear = true }) {
  const [filterValue, setFilterValue] = useState();

  return (
    <>
      <Input
        placeholder={placeholder}
        onChange={(e) => setFilterValue(get(e, 'target.value'))}
        style={{ width: '250px' }}
        allowClear={allowClear}
        defaultValue={defaultValue}
        onClear={() => onChange(filterValue)}
      />
      <Button icon={<SearchOutlined/>} onClick={() => onChange(filterValue)}/>
    </>
  );
}
export default InputFilter;
