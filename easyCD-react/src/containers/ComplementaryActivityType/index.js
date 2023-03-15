//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { ExclamationCircleFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Lodash
import get from 'lodash/get';
import isNil from 'lodash/isNil';

//Actions
import { actions as caTypeActions } from '@redux/complementary-activity-types';

//Columns
import Name from '@src/components/ComplementaryActivityTypes/Columns/Name';
import Description from '@src/components/ComplementaryActivityTypes/Columns/Description';
import Score from '@src/components/ComplementaryActivityTypes/Columns/Score';
import Unit from '@src/components/ComplementaryActivityTypes/Columns/Unit';
import Axle from '@src/components/ComplementaryActivityTypes/Columns/Axle';
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';
import CreateForm from '@src/components/ComplementaryActivityTypes/CreateForm';
import UpdateForm from '@src/components/ComplementaryActivityTypes/UpdateForm';

function ComplementaryActivityType () {
  const dispatch = useDispatch();

  //Redux state
  const complementaryActivityTypes = useSelector(
    (state) => state.complementaryActivityTypes.complementaryActivityTypes
  );
  const isLoading = useSelector((state) => state.complementaryActivityTypes.isLoading);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [caTypeBeingUpdated, setCaTypeBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (caType) => {
    setIsUpdateModalVisible(true);
    setCaTypeBeingUpdated(caType);
  };

  const onDeleteClick = useCallback((caType) => {
    Modal.confirm({
      title: 'Are you sure that you want to delete this CA Type ?',
      content:
        'Once you delete this Type, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(caTypeActions.deleteCaType(get(caType, '_id')));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Data
  const getCaTypes = useCallback(
    () => dispatch(caTypeActions.listCaTypes({ filters })),
    [dispatch, filters]
  );

  const columns = useMemo(
    () => [Name(), Description(), Score(), Unit(), Axle(), Actions({ onDeleteClick, onEditClick })],
    []
  );

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getCaTypes();
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
          complementaryActivityType={caTypeBeingUpdated}
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
            <Button icon={<ReloadOutlined />} onClick={() => getCaTypes()} type="default" />
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
      <div>
        <Spin spinning={isLoading}>
          <Table
            dataSource={complementaryActivityTypes}
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
      <ComponentHeader title="CA Types" />
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
export default ComplementaryActivityType;
