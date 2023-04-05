//Antd
import { CheckOutlined, ClockCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { Tag } from 'antd';

//Lodash
import get from 'lodash/get';
import isNil from 'lodash/isNil';

function TeacherApproval () {
  return {
    title: 'T. Approval',
    dataIndex: 'teacherApproval',
    render: (value) => {
      const approvalStatusIcons = {
        Approved: { icon: <CheckOutlined />, color: 'green' },
        Rejected: { icon: <CloseOutlined />, color: 'red' },
        Pending: { icon: <ClockCircleOutlined />, color: 'yellow' }
      };

      const key = isNil(value) ? 'Pending' : value ? 'Approved' : 'Rejected';
      const icon = approvalStatusIcons[ key ];

      return (
        <Tag color={get(icon, 'color')}>
          {get(icon, 'icon')} {key}
        </Tag>
      );
    }
  };
}

export default TeacherApproval;
