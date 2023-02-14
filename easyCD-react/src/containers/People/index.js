//React
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Modal, Space, Table } from 'antd';

//Lodash
import isNil from 'lodash/isNil';

//Components
import UpdateForm from '@src/components/Person/UpdateForm';

//Actions
import { actions as peopleActions } from '@redux/people';

//Columns
import Name from '@src/components/Person/Columns/Name';
import Email from '@src/components/Person/Columns/Email';
import Phone from '@src/components/Person/Columns/Phone';
import City from '@src/components/Person/Columns/City';
import UF from '@src/components/Person/Columns/UF';
import Address from '@src/components/Person/Columns/Address';

//Style
import './index.css';

function People () {
  const dispatch = useDispatch();

  //Redux State
  const people = useSelector((state) => state.people.people);
  const isLoading = useSelector((state) => state.people.people);

  //Local State
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState();
  const [filters, setFilters] = useState();

  //Data
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getPeople = useCallback(() => dispatch(peopleActions.listPeople({ filters })), [filters]);

  //Hooks
  useEffect(() => {
    if (isNil(people) && !isLoading) {
      getPeople({ filters });
    }
  }, [filters, getPeople, isLoading, people]);

  //Data
  const columns = useMemo(()=> {
    return [
      Name(),
      Email(),
      Phone(),
      City(),
      UF(),
      Address()
    ];
  },[]);

  //Renders
  const renderUpdateModal = () => {
    return (
      <Modal
        visible={isUpdateModalVisible}
        onCancel={() => setIsUpdateModalVisible(false)}
        closable={false}>
        <UpdateForm closeModal={() => setIsUpdateModalVisible(false)} />
      </Modal>
    );
  };

  const renderActionsButtons = () => {
    return (
      <div className="actions">
        <Space direction="vertical">
          <Space direction="horizontal" size="small">
            <Button
              icon={<ReloadOutlined />}
              onClick={getPeople}
              type="default"
            />
          </Space>
        </Space>
      </div>
    );
  };

  const renderFilters = () => {
    return <div>Filters</div>;
  };

  const renderTableHeader = () => {
    return (
      <Card className="container_body_header">
        <Space direction="vertical" className="table-header">
          {renderFilters()}
          {renderActionsButtons()}
        </Space>
      </Card>
    );
  };

  const renderTable = () => {
    return (
      <div>
        <Table
          columns={columns}
          dataSource={people}
          pagination={false}
          bordered={true}
        />
      </div>);
  };

  return (
    <div className="container_home">
      <div className="container_header">
        <span className="title_page_label">People</span>
      </div>
      <div className="container_body">{renderTableHeader()}{renderTable()}</div>
      {renderUpdateModal()}
    </div>
  );
}
export default People;
