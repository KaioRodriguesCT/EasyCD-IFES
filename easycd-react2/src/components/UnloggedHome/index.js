// React
import React from 'react';

// Antd
import { Col, Row } from 'antd';

// Style
import './index.less';

function UnloggedHome () {
  return (
    <div className="unlogged-home">
      <Row gutter={24} className="main-row">
        <Col span={6}>|Test</Col>
        <Col span={18}></Col>
      </Row>
    </div>
  );
}
export default UnloggedHome;
