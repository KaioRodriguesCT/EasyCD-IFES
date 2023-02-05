//React
import React, { useState } from 'react';

//Antd
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space } from 'antd';

//Components
import CreateForm from '@src/components/Person/CreateForm';
import UpdateForm from '@src/components/Person/UpdateForm';

//Style
import './index.css';

function People (){

  //Local State
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();

  //Renders
  const renderCreateModal = () => {
    return (
      <Modal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        closable={false}>
        <CreateForm closeModal={() => setIsCreateModalVisible(false)} />
      </Modal>
    );
  };

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
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalVisible(true)}
              type="primary"
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={() => console.log('Refresh')}
              type="default"
            />
          </Space>
        </Space>
      </div>
    );
  };

  const renderFilters = () => {
    return <div className="courses_table_header">Filters</div>;
  };

  const renderDataHeader = () => {
    return (
      <Card className="courses_table_header">
        <Space direction="vertical" className="table-header">
          {renderFilters()}
          {renderActionsButtons()}
        </Space>
      </Card>
    );
  };

  return <div className="container_home">
    <div className="container_header">
      <span className="title_page_label">People</span>
    </div>
    <div className="container_body">
      {renderDataHeader()}
    </div>
    {renderCreateModal()}
    {renderUpdateModal()}
  </div>;
}
export default People;