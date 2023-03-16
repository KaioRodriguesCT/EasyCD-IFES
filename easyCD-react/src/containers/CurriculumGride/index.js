//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Button, Card, Modal, Space, Spin, Table } from 'antd';
import { ExclamationCircleFilled, PlusOutlined, ReloadOutlined } from '@ant-design/icons';

//Lodash
import isNil from 'lodash/isNil';
import get from 'lodash/get';

//Actions
import { actions as curriculumGrideActions } from '@redux/curriculum-grides';
import { actions as courseActions } from '@redux/courses';

//Components
import ComponentFooter from '@src/components/ComponentFooter';
import ComponentHeader from '@src/components/ComponentHeader';
import CreateForm from '@src/components/CurriculumGride/CreateForm';
import UpdateForm from '@src/components/CurriculumGride/UpdateForm';

//Colmuns
import Name from '@src/components/CurriculumGride/Columns/Name';
import Course from '@src/components/CurriculumGride/Columns/Course';
import DateColumn from '@src/components/SharedComponents/Columns/DateColumn';
import BooleanColumn from '@src/components/SharedComponents/Columns/BooleanColumn';
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Style
import './index.css';

// eslint-disable-next-line max-statements
function CurriculumGride () {
  const dispatch = useDispatch();

  //Redux state
  const curriculumGrides = useSelector((state) => state.curriculumGrides.curriculumGrides);
  const courses = useSelector((state) => state.courses.courses);
  const isLoading = useSelector((state) => state.curriculumGrides.isLoading);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [curriculumGrideBeingUpdated, setCurriculumGrideBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (curriculumGride) => {
    setIsUpdateModalVisible(true);
    setCurriculumGrideBeingUpdated(curriculumGride);
  };

  const onDeleteClick = (curriculumGride) => {
    Modal.confirm({
      title: `Are you sure that you want to delete the Curriculum Gride: ${ get(
        curriculumGride,
        'name'
      ) } ?`,
      content:
        'Once you delete the curriculum Gride, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(curriculumGrideActions.deleteCurriculumGride(get(curriculumGride, '_id')));
      }
    });
  };

  //Data
  const getCurriculumGrides = useCallback(
    () => dispatch(curriculumGrideActions.listCurriculumGrides({ filters })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  const getPageData = () => {
    dispatch(courseActions.listCourses());
  };

  const columns = useMemo(
    () => [
      Name(),
      Course({ courses }),
      DateColumn({
        title: 'Dt Start',
        dataIndex: 'dtStart'
      }),
      DateColumn({
        title: 'Dt End',
        dataIndex: 'dtEnd'
      }),
      BooleanColumn({
        title: 'Is Active',
        dataIndex: 'isActive'
      }),
      Actions({
        onDeleteClick,
        onEditClick
      })
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [courses]
  );

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getCurriculumGrides();
    }
  }, [filters, getCurriculumGrides]);

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
          curriculumGride={curriculumGrideBeingUpdated}
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
              onClick={() => getCurriculumGrides()}
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
            dataSource={curriculumGrides}
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
      <ComponentHeader title="Curriculum Grides" />
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

export default CurriculumGride;
