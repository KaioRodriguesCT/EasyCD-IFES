//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { ExclamationCircleFilled, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Spin, Table } from 'antd';

//Lodash
import get from 'lodash/get';
import isNil from 'lodash/isNil';

//Actions
import { actions as caActions } from '@redux/complementary-activities';
import { actions as caTypeActions } from '@redux/complementary-activity-types';
import { actions as courseActions } from '@redux/courses';
import { actions as peopleActions } from '@redux/people';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';

//Columns
import ComplementaryActivityType from '@src/components/ComplementaryActivity/Columns/ComplementaryActivityType';
import Student from '@src/components/ComplementaryActivity/Columns/Student';
import Course from '@src/components/ComplementaryActivity/Columns/Course';
import IntegerColumn from '@src/components/SharedComponents/Columns/IntegerColumn';
import Status from '@src/components/ComplementaryActivity/Columns/Status';
import Actions from '@src/components/SharedComponents/Columns/Actions';

// eslint-disable-next-line max-statements
function ComplementaryActivity () {
  const dispatch = useDispatch();

  //Redux state
  const complementaryActivityTypes = useSelector(
    (state) => state.complementaryActivityTypes.complementaryActivityTypes
  );
  const students = useSelector((state) => state.people.peopleSlim);
  const courses = useSelector((state) => state.courses.courses);

  const complementaryActivities = useSelector(
    (state) => state.complementaryActivities.complementaryActivities
  );
  const isLoading = useSelector((state) => state.complementaryActivities.isLoading);

  //Local state
  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onDeleteClick = useCallback((complementaryActivity) => {
    Modal.confirm({
      title: 'Are you sure that you want to delete this Complementary Activity ?',
      content:
        'Once you delete this Type, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(caActions.deleteComplementaryActivity(get(complementaryActivity, '_id')));
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Data
  const getComplementaryActivities = useCallback(
    () => dispatch(caActions.listComplementaryActivities({ filters })),
    [dispatch, filters]
  );

  const getPageData = () => {
    dispatch(caTypeActions.listCaTypes());
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'student' }));
    dispatch(courseActions.listCourses());
  };

  const columns = useMemo(() => [
    ComplementaryActivityType({ complementaryActivityTypes }),
    Student({ students }),
    Course({ courses }),
    Status(),
    IntegerColumn({
      title:'Qty',
      dataIndex:'quantity'
    }),
    Actions({ onDeleteClick, showEdit: false })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], []);

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getComplementaryActivities();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    getPageData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Renders
  const renderFilters = () => <div></div>;

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
      <div>
        <Spin spinning={isLoading}>
          <Table
            dataSource={complementaryActivities}
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
      <ComponentHeader title="C. Activities" />
      <div className="container_body">
        {renderTableHeader()}
        {renderTable()}
      </div>
      <ComponentFooter />
    </div>
  );
}
export default ComplementaryActivity;
