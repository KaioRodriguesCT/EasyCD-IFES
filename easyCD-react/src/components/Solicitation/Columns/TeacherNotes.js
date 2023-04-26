import { Tooltip, Typography } from 'antd';

function TeacherNotes () {
  return {
    title: 'T. Notes',
    dataIndex: 'teacherNotes',
    render: (_) => (
      <Tooltip title={_}>
        <Typography.Text ellipsis={true} style={{ width: 100 }}>
          {_}
        </Typography.Text>
      </Tooltip>
    )
  };
}
export default TeacherNotes;
