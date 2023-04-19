//React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Actions
import { actions as solicitationActions } from '@redux/solicitations';

//Lodash
import get from 'lodash/get';
import isNil from 'lodash/isNil';

//Columns
import SolicitationType from '@src/components/Solicitation/StudentSolicitation/Columns/SolicitationType';
import Status from '@src/components/Solicitation/Columns/Status';
import TeacherApproval from '@src/components/Solicitation/Columns/TeacherApproval';
import TeacherNotes from '@src/components/Solicitation/Columns/TeacherNotes';
import CoordinatorApproval from '@src/components/Solicitation/Columns/CoordinatorApproval';
import CoordinatorNotes from '@src/components/Solicitation/Columns/CoordinatorNotes';
import BooleanColumn from '@src/components/SharedComponents/Columns/BooleanColumn';
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Components
import CreateForm from '@src/components/Solicitation/CreateForm';
import UpdateForm from '@src/components/Solicitation/UpdateForm';
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

//Style
import './index.css';

// eslint-disable-next-line max-statements
function StudentSolicitations () {
  const dispatch = useDispatch();

  //Redux state
  const user = useSelector((state) => state.authentication.user);
  const studentSolicitations = useSelector((state) => state.solicitations.studentSolicitations);
  const isLoading = useSelector((state) => state.solicitations.isLoading);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [solicitationBeingUpdated, setSolicitationBeingUpdated] = useState();

  const defaultFilters = { student: get(user,'person._id') };
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (solicitation) => {
    setIsUpdateModalVisible(true);
    setSolicitationBeingUpdated(solicitation);
  };

  //Data
  const getSolicitations = useCallback(
    () => dispatch(solicitationActions.getStudentSolicitations({ filters })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  const columns = useMemo(
    () => [
      SolicitationType(),
      Status(),
      TeacherApproval(),
      TeacherNotes(),
      CoordinatorApproval(),
      CoordinatorNotes(),
      BooleanColumn({
        title: 'Processed',
        dataIndex: 'isProcessed'
      }),
      Actions({ showDelete: false, onEditClick, showEditFn: (record) => !record.isProcessed })
    ],
    []
  );

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getSolicitations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const renderCreateModal = () => {
    return (
      <Modal
        visible={isCreateModalVisible}
        onCancel={() => setIsCreateModalVisible(false)}
        footer={null}
        closable={false}
        destroyOnClose={true}
      >
        <CreateForm student={user} closeModal={() => setIsCreateModalVisible(false)} />
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
          student={user}
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
      <div className="table_container">
        <Spin spinning={isLoading}>
          <Table
            dataSource={studentSolicitations}
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
      <ComponentHeader title="Student Solicitations" />
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

export default StudentSolicitations;
