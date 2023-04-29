//React
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Space, Spin, Table } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';

///Lodash
import get from 'lodash/get';
import isNil from 'lodash/isNil';
import clone from 'lodash/clone';

//Actions
import { actions as caActions } from '@redux/complementary-activities';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

//Columns
import Type from '@src/components/ComplementaryActivity/StudentComplementaryActivity/Columns/Type';
import Course from '@src/components/ComplementaryActivity/StudentComplementaryActivity/Columns/Course';
import Status from '@src/components/ComplementaryActivity/Columns/Status';
import IntegerColumn from '@src/components/SharedComponents/Columns/IntegerColumn';
import Evidence from '@src/components/ComplementaryActivity/Columns/Evidence';
import Axle from '@src/components/ComplementaryActivity/StudentComplementaryActivity/Columns/Axle';
import Unit from '@src/components/ComplementaryActivity/StudentComplementaryActivity/Columns/Unit';
import Score from '@src/components/ComplementaryActivity/StudentComplementaryActivity/Columns/Score';
import TotalScore from '@src/components/ComplementaryActivity/StudentComplementaryActivity/Columns/TotalScore';
import ComplementaryActivityTypeFilter from '@src/components/SharedComponents/ComplementaryActivityTypeFilter';
import AxleFilter from '@src/components/SharedComponents/AxleFilter';
import CourseFilter from '@src/components/SharedComponents/CourseFilter';
import CAStatusFilter from '@src/components/SharedComponents/CAStatusFilter';

function StudentComplementaryActivity () {
  const dispatch = useDispatch();

  //Redux state
  const user = useSelector((state) => state.authentication.user);
  const studentCActivities = useSelector(
    (state) => state.complementaryActivities.studentCActivities
  );
  const isLoading = useSelector((state) => state.complementaryActivities.isLoading);

  //Local state
  const defaultFilters = { student: get(user, 'person._id') };
  const [filters, setFilters] = useState(defaultFilters);

  //Data
  const getComplementaryActivities = useCallback(
    () => dispatch(caActions.getStudentCActivities({ filters })),
    [dispatch, filters]
  );

  const handleFilter = (filterField) => (value) => {
    const actualFilters = clone(filters) || {};
    actualFilters[ filterField ] = value;
    setFilters(actualFilters);
  };

  const columns = useMemo(
    () => [
      Type(),
      Axle(),
      Unit(),
      Score(),
      Course(),
      Status(),
      IntegerColumn({
        title: 'Qty',
        dataIndex: 'quantity'
      }),
      Evidence(),
      TotalScore()
    ],
    []
  );
  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getComplementaryActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  //Renders
  const renderFilters = () => (
    <div>
      <Space direction="horizontal">
        <Space direction="vertical">
          Type{' '}
          <ComplementaryActivityTypeFilter
            defaultValue={filters?.complementaryActivityType}
            onChange={handleFilter('complementaryActivityType')}
          />
        </Space>
        <Space direction="vertical">
          Axle <AxleFilter defaultValue={filters?.axle} onChange={handleFilter('axle')} />
        </Space>
        <Space direction="vertical">
          Course <CourseFilter defaultValue={filters?.course} onChange={handleFilter('course')} />
        </Space>
        <Space direction="vertical">
          Status <CAStatusFilter defaultValue={filters?.status} onChange={handleFilter('status')} />
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
              icon={<ReloadOutlined />}
              onClick={() => getComplementaryActivities()}
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
      <div className="table_container">
        <Spin spinning={isLoading}>
          <Table
            dataSource={studentCActivities}
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
      <ComponentHeader title="Student C. Activities" />
      <div className="container_body">
        {renderTableHeader()}
        {renderTable()}
      </div>
      <ComponentFooter />
    </div>
  );
}
export default StudentComplementaryActivity;
