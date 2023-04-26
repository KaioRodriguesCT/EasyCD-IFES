import { Tooltip, Typography } from 'antd';

function Observation (){
  return {
    title:'Observation',
    dataIndex: 'observation',
    render: (_) => (
      <Tooltip title={_}>
        <Typography.Text ellipsis={true} style={{ width: 250 }}>
          {_}
        </Typography.Text>
      </Tooltip>
    )
  };
}

export default Observation;