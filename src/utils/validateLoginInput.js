export default (userName, password) => {
  const errors = {};
  if (userName.trim() === '') {
    errors.userName = 'Username must not be empty';
  }
  if (password.trim() === '') {
    errors.password = 'Password must not be empty';
  }
  return {
    errors,
    valid: Object.keys(errors).length < 1,
  };
};
