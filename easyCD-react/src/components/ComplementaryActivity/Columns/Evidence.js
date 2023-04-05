//Antd
import { DownloadOutlined } from '@ant-design/icons';
import { Button } from 'antd';

function Evidence (){
  return {
    title:'Evidence',
    dataIndex: 'evidence',
    render: (value) =>
      (<a download="evidence" href={value}><Button icon={<DownloadOutlined/>}/></a>)
  };
}
export default Evidence;