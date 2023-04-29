use easyCD;
db.users.insert({
  username: 'admin',
  password: '$2a$10$GoaqLTxtMtjsB.MFPa5IRu4ofVl95RsT30LyDQjUbZEY52YAM4wjm',
  role: 'admin'
});
db.solicitationtypes.insertMany([
  {
    name: 'Complementary Activity',
    description: "Solicitation that add's complementary activities for the student.",
    requireTeacherApproval: false,
    requireCoordinatorApproval: true,
    allowSubmitFile: true,
    fieldsStructure: [
      {
        name: 'course',
        label: 'Course',
        type: 'ObjectId',
        _id: ObjectId('644d9883d2066ba836565bc6')
      },
      {
        name: 'complementaryActivityType',
        label: 'Activity Type',
        type: 'ObjectId',
        _id: ObjectId('644d98a26bebecd962df0718')
      },
      {
        name: 'quantity',
        label: 'Quantity',
        type: 'Number',
        _id: ObjectId('644d98a85d9b465109bd69b8')
      },
      {
        name: 'evidence',
        label: 'Evidence',
        type: 'Buffer',
        _id: ObjectId('644d98ab170b9fa9c92c4038')
      }
    ],
  }, {

    name: 'Enrollment',
    description: 'Solicitation of new enrollment for the student.',
    requireTeacherApproval: true,
    requireCoordinatorApproval: true,
    allowSubmitFile: true,
    fieldsStructure: [
      {
        name: 'classroom',
        label: 'Classroom',
        type: 'ObjectId',
        _id: ObjectId('644d98af2e14a8f6bcb7a73e')
      },
      {
        name: 'course',
        label: 'Course',
        type: 'ObjectId',
        _id: ObjectId('644d98b305b804904a7f05e9')
      }
    ],
  },
  {
    name: 'Enrollment Change',
    description: 'Solicitation that will cancel enrollment in one classroom, and are if the first enrollment are accepted.',
    requireTeacherApproval: true,
    requireCoordinatorApproval: true,
    allowSubmitFile: false,
    fieldsStructure: [
      {
        name: 'course',
        label: 'Course',
        type: 'ObjectId',
        _id: ObjectId('644d98b6fc4a18f59039d5c7')
      },
      {
        name: 'classroomToEnroll',
        label: 'Class to Enroll',
        type: 'ObjectId',
        _id: ObjectId('644d98ba084e854662a9fdbf')
      },
      {
        name: 'classroomToUnenroll',
        label: 'Class to Unenroll',
        type: 'ObjectId',
        _id: ObjectId('644d98c06405db2f47509e9d')
      }
    ],
  },
]);
