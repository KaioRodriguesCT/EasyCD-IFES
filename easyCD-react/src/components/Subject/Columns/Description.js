import { Tooltip, Typography } from 'antd';

function Description (){
  return {
    title:'Description',
    dataIndex: 'description',
    render: (_) => (
      <Tooltip title={_}>
        <Typography.Text ellipsis={true} style={{ width: 100 }}>
          {_}
        </Typography.Text>
      </Tooltip>
    )
  };
}

export default Description;