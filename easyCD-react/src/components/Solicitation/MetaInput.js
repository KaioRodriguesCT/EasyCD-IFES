//React
import React, { useEffect, useState } from 'react';

//Antd
import { Space } from 'antd';

//Lodash
import get from 'lodash/get';
import clone from 'lodash/clone';

//Handlers
import EnrollmentChangeSolicitiationInputs from './EnrollmentChangeSolicitiationInputs';
import EnrollmentSolicitationInputs from './EnrollmentSolicitationInputs';
import ActivitySolicitationInputs from './ActivitySolicitationInputs';

function MetaInput ({
  solicitationType,
  defaultValue,
  onChange,
  courses,
  classrooms,
  activityTypes
}) {
  const [meta, setMeta] = useState(defaultValue);

  //Hooks
  useEffect(() => {
    onChange(meta);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meta]);

  //Handlers
  const handleMetaChange = (field) => (value) => {
    const actualMeta = clone(meta) || {};
    actualMeta[ field ] = value;
    setMeta(actualMeta);
  };

  //Renders
  const renderSolicitationTypeInputs = () => {
    const sTypeName = get(solicitationType, 'name');
    switch (sTypeName) {
      case 'Enrollment Change':
        return (
          <EnrollmentChangeSolicitiationInputs
            classrooms={classrooms}
            meta={meta}
            handleMetaChange={handleMetaChange}
          />
        );
      case 'Enrollment':
        return (
          <EnrollmentSolicitationInputs
            classrooms={classrooms}
            handleMetaChange={handleMetaChange}
            meta={meta}
          />
        );
      case 'Complementary Activity':
        return (
          <ActivitySolicitationInputs
            activityTypes={activityTypes}
            courses={courses}
            meta={meta}
            handleMetaChange={handleMetaChange}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Space direction="vertical" size="large">
      {renderSolicitationTypeInputs()}
    </Space>
  );
}
export default MetaInput;
