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
import { actions as subjectActions } from '@redux/subjects';
import { actions as curriculumGrideActions } from '@redux/curriculum-grides';

//Components
import ComponentHeader from '@src/components/ComponentHeader';
import ComponentFooter from '@src/components/ComponentFooter';
import CreateForm from '@src/components/Subject/CreateForm';
import UpdateForm from '@src/components/Subject/UpdateForm';

//Columns
import Name from '@src/components/Subject/Columns/Name';
import Description from '@src/components/Subject/Columns/Description';
import CurriculumGride from '@src/components/Subject/Columns/CurriculumGride';
import QtyHours from '@src/components/Subject/Columns/QtyHours';
import ExternalCod from '@src/components/Subject/Columns/ExternalCod';
import Actions from '@src/components/SharedComponents/Columns/Actions';

//Style
import './index.css';

// eslint-disable-next-line max-statements
function Subjects () {
  const dispatch = useDispatch();

  //Redux state
  const subjects = useSelector((state) => state.subjects.subjects);
  const isLoading = useSelector((state) => state.subjects.isLoading);
  const curriculumGrides = useSelector((state) => state.curriculumGrides.curriculumGrides);

  //Local state
  const [isCreateModalVisible, setIsCreateModalVisible] = useState();
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [subjectBeingUpdated, setSubjectBeingUpdated] = useState();

  const defaultFilters = {};
  const [filters, setFilters] = useState(defaultFilters);

  //Handlers
  const onEditClick = (subject) => {
    setIsUpdateModalVisible(true);
    setSubjectBeingUpdated(subject);
  };

  const onDeleteClick = (subject) => {
    Modal.confirm({
      title: `Are you sure that you want to delete the Subject: ${ get(subject, 'name') } ?`,
      content:
        'Once you delete the Subject, all data related to that will be inactivate or lost on database.',
      icon: <ExclamationCircleFilled />,
      onOk () {
        dispatch(subjectActions.deleteSubject(get(subject, '_id')));
      }
    });
  };

  //Data
  const getSubjects = useCallback(
    () => dispatch(subjectActions.listSubjects({ filters })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filters]
  );

  const getPageData = () => {
    dispatch(curriculumGrideActions.listCurriculumGrides());
  };

  const columns = useMemo(() => [
    Name(),
    CurriculumGride({ curriculumGrides }),
    ExternalCod(),
    QtyHours(),
    Description(),
    Actions({ onDeleteClick, onEditClick })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [curriculumGrides]);

  //Hooks
  useEffect(() => {
    if (!isNil(filters)) {
      getSubjects();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  //Executes every time that this page is open
  useEffect(() => {
    getPageData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          subject={subjectBeingUpdated}
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
            <Button icon={<ReloadOutlined />} onClick={() => getSubjects()} type="default" />
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
            dataSource={subjects}
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
      <ComponentHeader title="Subjects" />
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

export default Subjects;
