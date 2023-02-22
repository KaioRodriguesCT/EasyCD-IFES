//Lodash
import clone from 'lodash/clone';
import get from 'lodash/get';

const handleInputChange = (state, setState, field) => (value) => {
  const newState = clone(state) || {};
  newState[ field ] = get(value, 'target.value') || null;
  setState(newState);
};

const handleSwitchChange = (state, setState, field) => (value) => {
  const newState = clone(state) || {};
  newState[ field ] = value || false;
  setState(newState);
};

// const handlePasswordChange = (state, setState, field) => (value) => {
//   const newState = clone(state) || {};
//   const password = get(value, 'target.value') || null;
//   const hashedPassword = password ? bcrypt.hashSync(password, 10) : null;
//   newState[ field ] = hashedPassword;
//   setState(newState);
// };

const handleSelectChange = (state, setState, field) => value => {
  const newState = clone(state) || {};
  newState[ field ] = value || null;
  setState(newState);

};
export { handleInputChange, handleSelectChange, handleSwitchChange };
