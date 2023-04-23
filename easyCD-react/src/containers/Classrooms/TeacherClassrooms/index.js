//React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Space, Spin, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

//Actions
import { actions as clasroomActions } from '@redux/classrooms';

//Lodash
import isNil from 'lodash/isNil';
import get from 'lodash/get';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

///Columns
import Name from '@src/components/Classroom/Columns/Name';
import Semester from '@src/components/Classroom/Columns/Semester';
import IntegerColumn from '@src/components/SharedComponents/Columns/IntegerColumn';
import BooleanColumn from '@src/components/SharedComponents/Columns/BooleanColumn';
import ClassTimes from '@src/components/Classroom/Columns/ClassTime';
import Subject from '@src/components/Classroom/TeacherClassroom/Columns/Subject';
import Course from '@src/components/Classroom/TeacherClassroom/Columns/Course';

function TeacherClassrooms () {
  const dispatch = useDispatch();

  //Redux State
  const user = useSelector((state) => state.authentication.user);
  const classrooms = useSelector((state) => state.classrooms.classrooms);
  const isLoading = useSelector((state) => state.classrooms.isLoading);

  //Local state
  const defaultFilters = { teacher: get(user, 'person._id') };
  const [filters, setFilters] = useState(defaultFilters);

  //Data
  const getClassrooms = useCallback(
    () => dispatch(clasroomActions.getTeacherClassrooms({ filters })),
    [dispatch, filters]
  );

  const columns = useMemo(() => {
    return [
      Name(),
      Semester(),
      IntegerColumn({
        title: 'Enrol. Limit',
        dataIndex: 'enrollmentsLimit'
      }),
      BooleanColumn({
        title: 'Allow Exceed Limit',
        dataIndex: 'allowExceedLimit'
      }),
      ClassTimes(),
      Subject(),
      Course()
    ];
  }, []);

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getClassrooms();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const renderFilters = () => <div></div>;

  const renderActionsButtons = () => {
    return (
      <div className="actions">
        <Space direction="vertical">
          <Space direction="horizontal" size="small">
            <Button icon={<ReloadOutlined />} onClick={() => getClassrooms()} type="default" />
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
      <ComponentHeader title="Teacher Classrooms" />
      <div className="container_body">
        {renderTableHeader()}
        {renderTable()}
      </div>
      <ComponentFooter />
    </div>
  );
}
export default TeacherClassrooms;
