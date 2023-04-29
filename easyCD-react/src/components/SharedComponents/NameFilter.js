import InputFilter from './InputFilter';

function NameFilter ({ onChange, defaultValue }) {
  return (
    <InputFilter defaultValue={defaultValue} placeholder="Type name" onChange={onChange} />
  );
}
export default NameFilter;
