import InputFilter from '../SharedComponents/InputFilter';

function EmailFilter ({ onChange, defaultValue }) {
  return (
    <InputFilter defaultValue={defaultValue} placeholder="Type email" onChange={onChange} />
  );
}
export default EmailFilter;
