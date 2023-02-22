//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Lodash
import isNil from 'lodash/isNil';

//Components
import UpdateForm from '@src/components/Person/UpdateForm';
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

//Actions
import { actions as peopleActions } from '@redux/people';

//Columns
import Name from '@src/components/Person/Columns/Name';
import Email from '@src/components/Person/Columns/Email';
import Phone from '@src/components/Person/Columns/Phone';
import City from '@src/components/Person/Columns/City';
import UF from '@src/components/Person/Columns/UF';
import Address from '@src/components/Person/Columns/Address';

//Style
import './index.css';

function People () {
  const dispatch = useDispatch();

  //Redux State
  const people = useSelector((state) => state.people.people);
  const isLoading = useSelector((state) => state.people.people);

  //Local State
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPeople = useCallback(() => dispatch(peopleActions.listPeople({ filters })), [filters]);

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getPeople();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  //Data
  const columns = useMemo(()=> {
    return [
      Name(),
      Email(),
      Phone(),
      City(),
      UF(),
      Address()
    ];
  },[]);

  //Renders
  const renderUpdateModal = () => {
    return (
      <Modal
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        closable={false}>
        <UpdateForm closeModal={() => setIsUpdateModalVisible(false)} />
      </Modal>
    );
  };

  const renderActionsButtons = () => {
    return (
      <div className="actions">
        <Space direction="vertical">
          <Space direction="horizontal" size="small">
            <Button
              icon={<ReloadOutlined />}
              onClick={getPeople}
              type="default"
            />
          </Space>
        </Space>
      </div>
    );
  };

  const renderFilters = () => {
    return <div></div>;
  };

  const renderTableHeader = () => {
    return (
      <Card className="people_table_header">
        <Space direction="vertical" className="table-header">
          {renderFilters()}
          {renderActionsButtons()}
        </Space>
      </Card>
    );
  };

  const renderTable = () => {
    return (
      <div>
        <Spin spinning={isLoading === true}>
          <Table
            columns={columns}
            dataSource={people}
            pagination={false}
            bordered={true}
          />
        </Spin>
      </div>);
  };

  return (
    <div className="container_home">
      <ComponentHeader title={'People'}/>
      <div className="container_body">{renderTableHeader()}{renderTable()}</div>
      <ComponentFooter/>
      {renderUpdateModal()}
    </div>
  );
}
export default People;
