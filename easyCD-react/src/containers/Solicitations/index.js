//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { ExclamationCircleFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Lodash
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import clone from 'lodash/clone';

//Actions
import { actions as stActions } from '@redux/solicitation-types';
import { actions as solicitationActions } from '@redux/solicitations';
import { actions as peopleActions } from '@redux/people';

//Columns
import SolicitationType from '@src/components/Solicitation/Columns/SolicitationType';
import Status from '@src/components/Solicitation/Columns/Status';
import Student from '@src/components/Solicitation/Columns/Student';
import BooleanColumn from '@src/components/SharedComponents/Columns/BooleanColumn';
import TeacherNotes from '@src/components/Solicitation/Columns/TeacherNotes';
import CoordinatorNotes from '@src/components/Solicitation/Columns/CoordinatorNotes';

//Components
import ComponentFooter from '@src/components/ComponentFooter';
import ComponentHeader from '@src/components/ComponentHeader';
import CreateForm from '@src/components/Solicitation/CreateForm';
import Actions from '@src/components/SharedComponents/Columns/Actions';
import UpdateForm from '@src/components/Solicitation/UpdateForm';
import TeacherApproval from '@src/components/Solicitation/Columns/TeacherApproval';
import CoordinatorApproval from '@src/components/Solicitation/Columns/CoordinatorApproval';
import SolicitationTypeFilter from '@src/components/SharedComponents/SolicitationTypeFilter';
import StudentFilter from '@src/components/SharedComponents/StudentFilter';
import SolicitationStatusFilter from '@src/components/SharedComponents/SolicitationStatusFilter';

// eslint-disable-next-line max-statements
function Solicitations () {
  const dispatch = useDispatch();

  //Redux state
  const solicitationTypes = useSelector((state) => state.solicitationTypes.solicitationTypes);
  const peopleSlim = useSelector((state) => state.people.peopleSlim);
  const solicitations = useSelector((state) => state.solicitations.solicitations);
  const isLoading = useSelector((state) => state.solicitations.isLoading);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [solicitationBeingUpdated, setSolicitationBeingUpdated] = useState();

  const defaultFilters = {
    status: 'Pending'
  };
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (solicitation) => {
    setIsUpdateModalVisible(true);
    setSolicitationBeingUpdated(solicitation);
  };

  const handleFilter = (filterField) => (value) => {
    const actualFilters = clone(filters) || {};
    actualFilters[ filterField ] = value;
    setFilters(actualFilters);
  };

  const onDeleteClick = useCallback((solicitation) => {
    Modal.confirm({
      title: 'Are you sure that you want to delete this Solicitation ?',
      content:
        'Once you delete this solicitation, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(solicitationActions.deleteSolicitation(get(solicitation, '_id')));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Data
  const getSolicitations = useCallback(
    () => dispatch(solicitationActions.listSolicitations({ filters })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  const getPageData = () => {
    dispatch(stActions.listSolicitationTypes());
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'student' }));
  };

  const columns = useMemo(
    () => [
      SolicitationType({ solicitationTypes }),
      Status(),
      Student({ students: peopleSlim }),
      TeacherApproval(),
      TeacherNotes(),
      CoordinatorApproval(),
      CoordinatorNotes(),
      BooleanColumn({
        title: 'Processed',
        dataIndex: 'isProcessed'
      }),
      Actions({ onDeleteClick, onEditClick, showEditFn: (record) => !record.isProcessed })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [peopleSlim, solicitationTypes]
  );

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getSolicitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  //Executes every time that this page is open
  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const renderCreateModal = () => {
    return (
      <Modal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        closable={false}
        destroyOnClose={true}
      >
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
        destroyOnClose={true}
      >
        <UpdateForm
          closeModal={() => setIsUpdateModalVisible(false)}
          solicitation={solicitationBeingUpdated}
        />
      </Modal>
    );
  };

  const renderFilters = () => (
    <div>
      <Space direction="horizontal">
        <Space direction="vertical">
          Type:{' '}
          <SolicitationTypeFilter
            onChange={handleFilter('solicitationType')}
            defaultValue={filters?.solicitationType}
          />
        </Space>
        <Space direction="vertical">
          Student:{' '}
          <StudentFilter onChange={handleFilter('student')} defaultValue={filters?.student} />
        </Space>
        <Space direction="vertical">
          Status:{' '}
          <SolicitationStatusFilter
            onChange={handleFilter('status')}
            defaultValue={filters?.status}
          />
        </Space>
      </Space>
    </div>
  );

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
            <Button icon={<ReloadOutlined />} onClick={() => getSolicitations()} type="default" />
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
            dataSource={solicitations}
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
      <ComponentHeader title="Solicitations" />
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

export default Solicitations;
