//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { ExclamationCircleFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//LOdash
import get from 'lodash/get';
import isNil from 'lodash/isNil';

//Actions
import { actions as enrollmentActions } from '@redux/enrollments';
import { actions as clasroomActions } from '@redux/classrooms';
import { actions as peopleActions } from '@redux/people';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';
import CreateForm from '@src/components/Enrollment/CreateForm';
import UpdateForm from '@src/components/Enrollment/UpdateForm';

//Columns
import Student from '@src/components/Enrollment/Columns/Student';
import Classroom from '@src/components/Enrollment/Columns/Classroom';
import Status from '@src/components/Enrollment/Columns/Status';
import Actions from '@src/components/SharedComponents/Columns/Actions';
import Observation from '@src/components/Enrollment/Columns/Observation';

// eslint-disable-next-line max-statements
function Enrollments () {
  const dispatch = useDispatch();

  //Redux state
  const enrollments = useSelector((state) => state.enrollments.enrollments);
  const isLoading = useSelector((state) => state.enrollments.isLoading);
  const classrooms = useSelector((state) => state.classrooms.classrooms);
  const people = useSelector((state) => state.people.people);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [enrollmentBeingUpdated, setEnrollmentBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (enrollment) => {
    setIsUpdateModalVisible(true);
    setEnrollmentBeingUpdated(enrollment);
  };

  const onDeleteClick = useCallback((enrollment) => {
    Modal.confirm({
      title: 'Are you sure that you want to delete this Enrollment ?',
      content:
        'Once you delete this enrollment, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(enrollmentActions.deleteEnrollment(get(enrollment, '_id')));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Data
  const getEnrollments = useCallback(
    () => dispatch(enrollmentActions.listEnrollments({ filters })),
    [dispatch, filters]
  );

  const getPageData = () => {
    dispatch(clasroomActions.listClassrooms());
    dispatch(peopleActions.listPeople());
  };

  const columns = useMemo(() => [
    Student({ people }),
    Classroom(),
    Observation(),
    Status(),
    Actions({ onDeleteClick, onEditClick })
  ],[onDeleteClick, people]);

  //Hooks
  useEffect(()=> {
    if(!isNil(filters)){
      getEnrollments();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[filters]);

  //Executes every time that this page is open
  useEffect(()=> {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <UpdateForm
          closeModal={() => setIsUpdateModalVisible(false)}
          enrollment={enrollmentBeingUpdated}
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
              onClick={() => getEnrollments()}
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
      <div>
        <Spin spinning={isLoading}>
          <Table
            dataSource={enrollments}
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
      <ComponentHeader title="Enrollments" />
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

export default Enrollments;
