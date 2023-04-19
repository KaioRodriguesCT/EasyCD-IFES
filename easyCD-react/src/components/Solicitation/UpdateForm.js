//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Card, Divider, Form, Radio, Space } from 'antd';

//Actions
import { actions as courseActions } from '@redux/courses';
import { actions as classroomsActions } from '@redux/classrooms';
import { actions as caTypeAction } from '@redux/complementary-activity-types';
import { actions as stActions } from '@redux/solicitation-types';
import { actions as peopleActions } from '@redux/people';
import { actions as solicitationActions } from '@redux/solicitations';

//Lodash
import clone from 'lodash/clone';
import find from 'lodash/find';
import get from 'lodash/get';
import isFunction from 'lodash/isFunction';
import isNil from 'lodash/isNil';

//Handlers
import { handleInputChange, handleSelectChange } from '@src/shared/handlers';

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';
import MetaInput from './MetaInput';
import FormActionButtons from '../SharedComponents/FormActionButtons';
import StatusSelect from './StatusSelect';

function UpdateForm ({ closeModal, solicitation, student }) {
  const dispatch = useDispatch();
  const [form] = Form.useForm();

  //Redux state
  const solicitationTypes = useSelector((state) => state.solicitationTypes.solicitationTypes);
  const classrooms = useSelector((state) => state.classrooms.classrooms);
  const courses = useSelector((state) => state.courses.courses);
  const caTypes = useSelector(
    (state) => state.complementaryActivityTypes.complementaryActivityTypes
  );
  const students = useSelector((state) => state.people.peopleSlim);

  //Local state
  const [newSolicitation, setNewSolicitation] = useState(solicitation);

  //Hooks
  useEffect(() => {
    dispatch(stActions.listSolicitationTypes());
    dispatch(peopleActions.listSlimPeopleByRole({ role: 'student' }));
    dispatch(courseActions.listCourses());
    dispatch(classroomsActions.listClassrooms());
    dispatch(caTypeAction.listCaTypes());
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
          <Form.Item
            valuePropName="defaultValue"
            name="solicitationType"
            label="Solicitation Type:"
          >
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
          {student ? null
            : <Form.Item valuePropName="defaultValue" name="student" label="Student:">
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
          }
          <Form.Item name="status" label="Status:" valuePropName="defaultValue">
            <StatusSelect showRestrict={isNil(student)}onChange={handleSelectChangeLocal('status')} />
          </Form.Item>
          {student ? null
            : <Space direction="horizontal" size="large">
              <Form.Item name="teacherApproval" label="T. Approval:">
                <Radio.Group
                  onChange={handleInputChange(newSolicitation, setNewSolicitation, 'teacherApproval')}
                >
                  <Radio value={true}>Approved</Radio>
                  <Radio value={false}>Rejected</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item name="coordinatorApproval" label="C. Approval:">
                <Radio.Group
                  onChange={handleInputChange(
                    newSolicitation,
                    setNewSolicitation,
                    'coordinatorApproval'
                  )}
                >
                  <Radio value={true}>Approved</Radio>
                  <Radio value={false}>Rejected</Radio>
                </Radio.Group>
              </Form.Item>
            </Space>
          }
          <Divider>Solicitation Inputs</Divider>
          <Form.Item name="meta" label="Meta:" valuePropName="defaultValue">
            <MetaInput
              onChange={handleMetaChange}
              solicitationType={find(solicitationTypes, {
                _id: get(newSolicitation, 'solicitationType')
              })}
              activityTypes={caTypes}
              classrooms={classrooms}
              courses={courses}
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
