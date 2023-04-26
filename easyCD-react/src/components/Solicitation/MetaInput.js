//React
import React, { useEffect, useMemo, useState } from 'react';

//Antd
import { Space } from 'antd';

//Lodash
import get from 'lodash/get';
import clone from 'lodash/clone';
import filter from 'lodash/filter';

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

  const filteredClassrooms = useMemo(
    () => filter(classrooms, (classroom) => classroom?.course?._id === meta?.course),
    [classrooms, meta?.course]
  );

  //Renders
  const renderSolicitationTypeInputs = () => {
    const sTypeName = get(solicitationType, 'name');
    switch (sTypeName) {
      case 'Enrollment Change':
        return (
          <EnrollmentChangeSolicitiationInputs
            courses={courses}
            classrooms={filteredClassrooms}
            meta={meta}
            handleMetaChange={handleMetaChange}
          />
        );
      case 'Enrollment':
        return (
          <EnrollmentSolicitationInputs
            courses={courses}
            classrooms={filteredClassrooms}
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
