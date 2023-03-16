//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Modal, Space, Spin, Table } from 'antd';
import { ExclamationCircleFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';

//Lodash
import isNil from 'lodash/isNil';
import get from 'lodash/get';

//Actions
import { actions as stActions } from '@redux/solicitation-types';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';
import CreateForm from '@src/components/SolicitationType/CreateForm';
import UpdateForm from '@src/components/SolicitationType/UpdateForm';
import FieldsStructure from '@src/components/SolicitationType/Columns/FieldsStructure';

//Columns
import Name from '@src/components/SolicitationType/Columns/Name';
import BooleanColumn from '@src/components/SharedComponents/Columns/BooleanColumn';
import Description from '@src/components/SolicitationType/Columns/Description';
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Style
import './index.less';

function SolicitationTypes () {
  const dispatch = useDispatch();

  //Redux state
  const solicitationTypes = useSelector((state) => state.solicitationTypes.solicitationTypes);
  const isLoading = useSelector((state) => state.solicitationTypes.isLoading);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [solicitationTypeBeingUpdated, setSolicitationTypeBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (solicitationType) => {
    setIsUpdateModalVisible(true);
    setSolicitationTypeBeingUpdated(solicitationType);
  };

  const onDeleteClick = useCallback((solicitationType) => {
    Modal.confirm({
      title: 'Are you sure that you want to delete this Solicitation type ?',
      content:
        'Once you delete this type, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(stActions.deleteSolicitationType(get(solicitationType, '_id')));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Data
  const getSolicitationTypes = useCallback(
    () => dispatch(stActions.listSolicitationTypes({})),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  const columns = useMemo(
    () => [
      Name(),
      Description(),
      FieldsStructure(),
      BooleanColumn({
        title: 'Req. Teacher Approval',
        dataIndex: 'requireTeacherApproval'
      }),
      BooleanColumn({
        title: 'Req. Coord. Approval',
        dataIndex: 'requireCoordinatorApproval'
      }),
      BooleanColumn({
        title: 'Allow File',
        dataIndex: 'allowSubmitFile'
      }),
      Actions({ onEditClick, onDeleteClick })
    ],
    [onDeleteClick]
  );

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getSolicitationTypes();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

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
        <UpdateForm
          closeModal={() => setIsUpdateModalVisible(false)}
          solicitationType={solicitationTypeBeingUpdated}
        />
      </Modal>
    );
  };

  const renderFilters = () => <div></div>;

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
              onClick={() => getSolicitationTypes()}
              type="default"
            />
          </Space>
        </Space>
      </div>
    );
  };

  const renderTableHeader = () => {
    return (
      <Card className="table_header">
        <Space direction="vertical" style={{ width: '100%' }}>
          {renderFilters()}
          {renderActionsButtons()}
        </Space>
      </Card>
    );
  };

  const renderTable = () => {
    return (
      <div className="table_container">
        <Spin spinning={isLoading}>
          <Table
            dataSource={solicitationTypes}
            columns={columns}
            pagination={false}
            bordered={true}
            size="large"
          />
        </Spin>
      </div>
    );
  };

  return (
    <div className="container_home">
      <ComponentHeader title="Solicitation Types" />
      <div className="container_body">
        {renderTableHeader()}
        {renderTable()}
      </div>
      <ComponentFooter />
      {renderCreateModal()}
      {renderUpdateModal()}
    </div>
  );
}
export default SolicitationTypes;
