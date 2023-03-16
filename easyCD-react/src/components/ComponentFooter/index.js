//React
import React from 'react';

//Antd
import { Space } from 'antd';

//Style
import './index.css';
function ComponentFooter () {
  return (
    <div className="component_footer">
      <Space direction="vertical">
        <span>@Copyright SynMcall. All rights reserved.</span>
      </Space>
    </div>
  );
}

export default ComponentFooter;
