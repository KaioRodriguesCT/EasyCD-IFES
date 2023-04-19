//React
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

//Antd
import { Card, Divider, Form } from 'antd';

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

//Components
import ComponentSelect from '../SharedComponents/ComponentSelect';
import FormActionButtons from '../SharedComponents/FormActionButtons';
import MetaInput from './MetaInput';

//Handlers
import { handleSelectChange } from '@src/shared/handlers';

function CreateForm ({ closeModal, student }) {
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
  const [newSolicitation, setNewSolicitation] = useState();

  useEffect(() => {
    if (student) {
      const actualSolicitation = clone(newSolicitation) || {};
      actualSolicitation.student = get(student, 'person._id');
      setNewSolicitation(actualSolicitation);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [student]);

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
    dispatch(solicitationActions.createSolicitation(newSolicitation));
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
      <Card title="Solicitation - Create Form">
        <Form form={form} layout="vertical" onFinish={onFormSubmit}>
          <Form.Item name="solicitationType" label="Solicitation Type:">
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
          {student ? null : (
            <Form.Item name="student" label="Student:">
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
          )}
          <Divider>Solicitation Inputs</Divider>
          <Form.Item name="meta" label="Meta:">
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
export default CreateForm;
