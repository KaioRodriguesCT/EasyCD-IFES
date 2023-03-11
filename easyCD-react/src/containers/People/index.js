//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Lodash
import isNil from 'lodash/isNil';

//Components
import CreateForm from '@src/components/Person/CreateForm';
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
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Style
import './index.css';

function People () {
  const dispatch = useDispatch();

  //Redux State
  const people = useSelector((state) => state.people.people);
  const isLoading = useSelector((state) => state.people.people);

  //Local State
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [personBeingUpdated, setPersonBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (person) => {
    setIsUpdateModalVisible(true);
    setPersonBeingUpdated(person);
  };

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
      Actions({ onEditClick, showDelete: false })
    ];
  },[]);

  //Renders
  const renderCreateModal = () => {
    return (
      <Modal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        closable={false}
        destroyOnClose={true}>
        <CreateForm closeModal={() => setIsCreateModalVisible(false)} />
      </Modal>
    );
  };

  const renderUpdateModal = () => {
    return (
      <Modal
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        footer={null}
        closable={false}
        destroyOnClose={true}>
        <UpdateForm person={personBeingUpdated} closeModal={() => setIsUpdateModalVisible(false)} />
      </Modal>
    );
  };

  const renderActionsButtons = () => {
    return (
      <div className="actions">
        <Space direction="vertical">
          <Space direction="horizontal" size="small">
            <Button
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              type="primary"
            />
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
      {renderCreateModal()}
    </div>
  );
}
export default People;
