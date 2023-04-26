import { Tooltip, Typography } from 'antd';

function CoordinatorNotes () {
  return {
    title: 'C. Notes',
    dataIndex: 'coordinatorNotes',
    render: (_) => (
      <Tooltip title={_}>
        <Typography.Text ellipsis={true} style={{ width: 100 }}>
          {_}
        </Typography.Text>
      </Tooltip>
    )
  };
}
export default CoordinatorNotes;
