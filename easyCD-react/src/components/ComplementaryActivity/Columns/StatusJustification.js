import { Tooltip, Typography } from 'antd';

function StatusJustification (){
  return {
    title:'Justification',
    dataIndex: 'statusJustification',
    render: (_) => (
      <Tooltip title={_}>
        <Typography.Text ellipsis={true} style={{ width: 100 }}>
          {_}
        </Typography.Text>
      </Tooltip>
    )
  };
}
export default StatusJustification;