import get from 'lodash/get';

function Subject (){
  return {
    title: 'Subject',
    dataIndex:'subject.name',
    render: (_,record) => get(record, 'subject.name')
  };
}
export default Subject;