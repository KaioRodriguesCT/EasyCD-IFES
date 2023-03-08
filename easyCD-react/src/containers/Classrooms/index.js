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
import { actions as clasroomActions } from '@redux/classrooms';
import { actions as subjectActions } from '@redux/subjects';
import { actions as peopleActions } from '@redux/people';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';
import CreateForm from '@src/components/Classroom/CreateForm';
import UpdateForm from '@src/components/Classroom/UpdateForm';

//Columns
import Subject from '@src/components/Classroom/Columns/Subject';
import Semester from '@src/components/Classroom/Columns/Semester';
import ClassTimes from '@src/components/Classroom/Columns/ClassTime';
import Teacher from '@src/components/Classroom/Columns/Teacher';
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Style
import './index.css';
import BooleanColumn from '@src/components/SharedComponents/Columns/BooleanColumn';
import IntegerColumn from '@src/components/SharedComponents/Columns/IntegerColumn';
import Name from '@src/components/Classroom/Columns/Name';

// eslint-disable-next-line max-statements
function Classrooms () {
  const dispatch = useDispatch();

  //Redux state
  const classrooms = useSelector((state) => state.classrooms.classrooms);
  const isLoading = useSelector((state) => state.classrooms.isLoading);
  const subjects = useSelector((state) => state.subjects.subjects);
  const peopleSlim = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [classroomBeingUpdated, setClassroomBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (classroom) => {
    setIsUpdateModalVisible(true);
    setClassroomBeingUpdated(classroom);
  };

  const onDeleteClick = useCallback((classroom) => {
    Modal.confirm({
      title: 'Are you sure that you want to delete this Classroom ?',
      content:
        'Once you delete this classroom, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(clasroomActions.deleteClassroom(get(classroom, '_id')));
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  },[]);

  //Data
  const getClassrooms = useCallback(
    () => dispatch(clasroomActions.listClassrooms({ filters })),
    [dispatch, filters]
  );

  const getPageData = () => {
    dispatch(subjectActions.listSubjects({}));
    dispatch(peopleActions.listSlimPeopleByRole({ role:'teacher' }));
  };

  const columns = useMemo(()=> {
    return [
      Name(),
      Subject({ subjects }),
      Semester(),
      ClassTimes(),
      Teacher({ peopleSlim }),
      BooleanColumn({ title:'Allow Exc. Limit', dataIndex:'allowExceedLimit' }),
      IntegerColumn({ title:'Enroll. Limit', dataIndex:'enrollmentsLimit' }),
      Actions({ onDeleteClick, onEditClick })
    ];
  },[onDeleteClick, peopleSlim, subjects]);

  //Hooks
  useEffect(()=> {
    if(!isNil(filters)){
      getClassrooms();
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
          classroom={classroomBeingUpdated}
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
              onClick={() => getClassrooms()}
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
            dataSource={classrooms}
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
      <ComponentHeader title="Classrooms" />
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

export default Classrooms;
