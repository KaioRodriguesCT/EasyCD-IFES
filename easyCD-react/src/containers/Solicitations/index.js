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
import Meta from '@src/components/Solicitation/Columns/Meta';

//Components
import ComponentFooter from '@src/components/ComponentFooter';
import ComponentHeader from '@src/components/ComponentHeader';
import CreateForm from '@src/components/Solicitation/CreateForm';
import Actions from '@src/components/SharedComponents/Columns/Actions';
import UpdateForm from '@src/components/Solicitation/UpdateForm';

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

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (solicitation) => {
    setIsUpdateModalVisible(true);
    setSolicitationBeingUpdated(solicitation);
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
    () => dispatch(solicitationActions.listSolicitations()),
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
      BooleanColumn({
        title: 'T. Approval',
        dataIndex: 'teacherApproval'
      }),
      TeacherNotes(),
      BooleanColumn({
        title: 'C. Approval',
        dataIndex: 'coordinatorApproval'
      }),
      CoordinatorNotes(),
      BooleanColumn({
        title: 'Processed',
        dataIndex: 'isProcessed'
      }),
      Meta(),
      Actions({ onDeleteClick, onEditClick })
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
          solicitation={solicitationBeingUpdated}
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
      <div>
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
