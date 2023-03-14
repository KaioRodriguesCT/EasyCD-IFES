//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Card, Divider, Form } from 'antd';

//Actions
import { actions as stActions } from '@redux/solicitation-types';
import { actions as peopleActions } from '@redux/people';
import { actions as solicitationActions } from '@redux/solicitations';

///Lodash
//Lodash
import clone from 'lodash/clone';
import find from 'lodash/find';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';

//Handlers
import { handleSelectChange } from '@src/shared/handlers';

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';
import MetaInput from './MetaInput';
import FormActionButtons from '../SharedComponents/FormActionButtons';
import StatusSelect from './StatusSelect';

function UpdateForm ({ closeModal, solicitation }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const solicitationTypes = useSelector((state) => state.solicitationTypes.solicitationTypes);
  const students = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newSolicitation, setNewSolicitation] = useState(solicitation);

  //Hooks
  useEffect(() => {
    dispatch(stActions.listSolicitationTypes());
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'student' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  //Handlers
  const onFormSubmit = async () => {
    await form.validateFields();
    dispatch(solicitationActions.updateSolicitation(newSolicitation));
    if (isFunction(closeModal)) {
      closeModal();
    }
    await form.resetFields();
  };

  const onCancel = async () => {
    if (isFunction(closeModal)) {
      closeModal();
    }
    await form.resetFields();
  };

  const handleSelectChangeLocal = (field) =>
    handleSelectChange(newSolicitation, setNewSolicitation, field);

  const handleMetaChange = (value) => {
    const actualSolicitation = clone(newSolicitation) || {};
    actualSolicitation.meta = value;
    setNewSolicitation(actualSolicitation);
  };

  //Renders
  const renderForm = () => {
    return (
      <Card title="Solicitation - Update Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit} initialValues={solicitation}>
          <Form.Item valuePropName="defaultValue" name="solicitationType" label="Solicitation Type">
            <ComponentSelect
              data={solicitationTypes}
              onChange={handleSelectChangeLocal('solicitationType')}
              mapOptions={(elem) => ({
                label: elem.name,
                value: elem._id
              })}
              placeholder="Select solicitation type"
            />
          </Form.Item>
          <Form.Item valuePropName="defaultValue" name="student" label="Student">
            <ComponentSelect
              data={students}
              onChange={handleSelectChangeLocal('student')}
              mapOptions={(elem) => ({
                label: elem.name,
                value: elem._id
              })}
              placeholder="Select student"
            />
          </Form.Item>
          <Form.Item name="status" label="Status" valuePropName="defaultValue">
            <StatusSelect
              onChange={handleSelectChangeLocal('status')}
            />
          </Form.Item>
          <Divider>Solicitation Inputs</Divider>
          <Form.Item name="meta" label="Meta" valuePropName="defaultValue">
            <MetaInput
              onChange={handleMetaChange}
              solicitationType={find(solicitationTypes, {
                _id: get(newSolicitation, 'solicitationType')
              })}
            />
          </Form.Item>
          {FormActionButtons({ onCancel })}
        </Form>
      </Card>
    );
  };

  return <>{renderForm()}</>;
}
export default UpdateForm;
