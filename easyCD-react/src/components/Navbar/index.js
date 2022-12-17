//React
import { Outlet } from 'react-router-dom';

//Antd
import { Col, Row } from 'antd';

function Navbar () {
  return (
    <>
      <Row gutter={24}>
        <Col span={8}>
          <h1>navbar</h1>
        </Col>
        <Col span={16}>
          <Outlet />
        </Col>
      </Row>
    </>
  );
}
export default Navbar;
