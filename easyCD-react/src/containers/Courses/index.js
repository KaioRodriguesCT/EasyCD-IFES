//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Atnd
import { ExclamationCircleFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Components
import CreateForm from '@src/components/Course/CreateForm';
import UpdateForm from '@src/components/Course/UpdateForm';

//Actions
import { actions as courseActions } from '@redux/courses';
import { actions as peopleActions } from '@redux/people';

//Lodash
import isNil from 'lodash/isNil';
import get from 'lodash/get';

//Columns
import Name from '@components/Course/Columns/Name';
import Coordinator from '@components/Course/Columns/Coordinator';
import Description from '@src/components/Course/Columns/Description';
import Actions from '@components/Course/Columns/Actions';

//Style
import './index.css';

// eslint-disable-next-line max-statements
function Courses () {
  const dispatch = useDispatch();

  //Redux state
  const courses = useSelector((state) => state.courses.courses);
  const isLoading = useSelector((state) => state.courses.isLoading);
  const peopleSlim = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [courseBeingUpdated, setCourseBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);


  //Handlers
  const onEditClick = (course) => {
    setIsUpdateModalVisible(true);
    setCourseBeingUpdated(course);
  };

  const onDeleteClick = (record) => {
    Modal.confirm({
      title:`Are you sure that you want to delete the course: ${ get(record, 'name') } ?`,
      content:'Once you delete the course, all data related to that course will be inactivate or lost on database.',
      icon:<ExclamationCircleFilled/>,
      onOk () {
        dispatch(courseActions.deleteCourse( get(record,'_id') ));
      }
    });
  };

  //Data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getCourses = useCallback(() => dispatch(courseActions.listCourses({ filters })), [filters]);

  const getPageData = () => {
    dispatch(peopleActions.listSlimPeople({}));
  };

  const columns = useMemo(()=> {
    return [
      Name(),
      Coordinator({ peopleSlim }),
      Description(),
      Actions({ onDeleteClick, onEditClick })
    ];
  },[peopleSlim]);

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getCourses();
    }
  }, [filters, getCourses]);

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
        <UpdateForm closeModal={() => setIsUpdateModalVisible(false)} course={courseBeingUpdated}/>
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
              onClick={() => getCourses()}
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

  const renderCoursesTable = () => {
    return (
      <div>
        <Spin spinning={isLoading}>
          <Table dataSource={courses} columns={columns} pagination={false} bordered={true} size="large"/>
        </Spin>
      </div>
    );
  };

  return (
    <div className="container_home">
      <div className="container_header">
        <span className="title_page_label">Courses</span>
      </div>
      <div className="container_body">
        {renderDataHeader()}
        {renderCoursesTable()}
      </div>
      {renderCreateModal()}
      {renderUpdateModal()}
    </div>
  );
}
export default Courses;
