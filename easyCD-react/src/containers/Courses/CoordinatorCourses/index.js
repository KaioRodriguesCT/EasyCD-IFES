//React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Space, Spin, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

//Actions
import { actions as courseActions } from '@redux/courses';

//Lodash
import isNil from 'lodash/isNil';
import get from 'lodash/get';
import clone from 'lodash/clone';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

///Columns
import Name from '@src/components/Course/Columns/Name';
import Description from '@src/components/Course/Columns/Description';
import NameFilter from '@src/components/SharedComponents/NameFilter';

function CoordinatorCourses () {
  const dispatch = useDispatch();

  ///Redux state
  const user = useSelector((state) => state.authentication.user);
  const courses = useSelector((state) => state.courses.courses);
  const isLoading = useSelector((state) => state.courses.isLoading);

  const defaultFilters = { coordinator: get(user, 'person._id') };
  const [filters, setFilters] = useState(defaultFilters);

  //Data
  const getCourses = useCallback(
    () => dispatch(courseActions.getCoordinatorCourses({ filters })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  const handleFilter = (filterField) => (value) => {
    const actualFilters = clone(filters) || {};
    actualFilters[ filterField ] = value;
    setFilters(actualFilters);
  };

  const columns = useMemo(() => {
    return [
      Name(),
      Description()
    ];
  }, []);

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getCourses();
    }
  }, [filters, getCourses]);

  //Renders
  const renderActionsButtons = () => {
    return (
      <div className="actions">
        <Space direction="vertical">
          <Space direction="horizontal" size="small">
            <Button icon={<ReloadOutlined />} onClick={() => getCourses()} type="default" />
          </Space>
        </Space>
      </div>
    );
  };

  const renderFilters = () => {
    return <div>
      <Space direction="horizontal">
        <Space direction="vertical">
          Name: <NameFilter defaultValue={filters?.name} onChange={handleFilter('name')}/>
        </Space>
      </Space>
    </div>;
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
      <div className="table_container">
        <Spin spinning={isLoading}>
          <Table
            dataSource={courses}
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
      <ComponentHeader title={'Courses'} />
      <div className="container_body">
        {renderDataHeader()}
        {renderCoursesTable()}
      </div>
      <ComponentFooter />
    </div>
  );
}

export default CoordinatorCourses;
