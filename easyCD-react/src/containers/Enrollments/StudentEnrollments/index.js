//React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Space, Spin, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

//Lodash
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import clone from 'lodash/clone';

//Actions
import { actions as enrollmentActions } from '@redux/enrollments';

//Columns
import Coordinator from '@src/components/Enrollment/StudentEnrollment/Columns/Coordinator';
import Teacher from '@src/components/Enrollment/StudentEnrollment/Columns/Teacher';
import Course from '@src/components/Enrollment/StudentEnrollment/Columns/Course';
import Classroom from '@src/components/Enrollment/StudentEnrollment/Columns/Classroom';
import ClassTimes from '@src/components/Classroom/Columns/ClassTime';
import Observation from '@src/components/Enrollment/Columns/Observation';
import Status from '@src/components/Enrollment/Columns/Status';
import Subject from '@src/components/Enrollment/StudentEnrollment/Columns/Subject';
import Semester from '@src/components/Classroom/Columns/Semester';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

//Style
import './index.css';
import CoordinatorFilter from '@src/components/SharedComponents/CoordinatorFilter';
import ClassroomFilter from '@src/components/SharedComponents/ClassroomFilter';
import SubjectFilter from '@src/components/SharedComponents/SubjectFilter';
import CourseFilter from '@src/components/SharedComponents/CourseFilter';
import EnrollmentStatusFilter from '@src/components/SharedComponents/EnrollmentStatusFilter';

function StudentEnrollments () {
  const dispatch = useDispatch();

  //Redux state
  const studentEnrollments = useSelector((state) => state.enrollments.studentEnrollments);
  const isLoading = useSelector((state) => state.enrollments.isLoading);
  const user = useSelector((state) => state.authentication.user);

  const defaultFilters = { student: get(user, 'person._id'), status: 'In Progress' };
  const [filters, setFilters] = useState(defaultFilters);

  //Data
  const getEnrollments = useCallback(
    () => dispatch(enrollmentActions.getStudentEnrollments({ filters })),
    [dispatch, filters]
  );

  const columns = useMemo(
    () => [
      Teacher(),
      Classroom(),
      ClassTimes({ dataIndex: 'classroom.classTimes' }),
      Semester({ dataIndex: 'classroom.semester' }),
      Subject(),
      Course(),
      Coordinator(),
      Observation(),
      Status()
    ],
    []
  );

  const handleFilter = (filterField) => (value) => {
    const actualFilters = clone(filters) || {};
    actualFilters[ filterField ] = value;
    setFilters(actualFilters);
  };

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getEnrollments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const renderFilters = () => (
    <div>
      <Space direction="horizontal">
        <Space direction="vertical">
          Teacher{' '}
          <CoordinatorFilter defaultValue={filters?.teacher} onChange={handleFilter('teacher')} />
        </Space>
        <Space direction="vertical">
          Classroom{' '}
          <ClassroomFilter defaultValue={filters?.classroom} onChange={handleFilter('classroom')} />
        </Space>
        <Space direction="vertical">
          Subject{' '}
          <SubjectFilter defaultValue={filters?.subject} onChange={handleFilter('subject')} />
        </Space>
        <Space direction="vertical">
          Course <CourseFilter defaultValue={filters?.course} onChange={handleFilter('course')} />
        </Space>
        <Space direction="vertical">
          Status{' '}
          <EnrollmentStatusFilter
            defaultValue={filters?.status}
            onChange={handleFilter('status')}
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
            <Button icon={<ReloadOutlined />} onClick={() => getEnrollments()} type="default" />
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
            dataSource={studentEnrollments}
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
      <ComponentHeader title="Student Enrollments" />
      <div className="container_body">
        {renderTableHeader()}
        {renderTable()}
      </div>
      <ComponentFooter />
    </div>
  );
}
export default StudentEnrollments;
