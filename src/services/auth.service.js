const userRepository = require("../Repository/user.repository");
const roleRepository = require("../Repository/role.repository");

exports.register = async (user) => {
  try {
    user.role = await roleRepository.getRoleByName("user");
    const createdUser = await userRepository.registerUser(user);
    return createdUser;
  } catch (error) {
    throw error;
  }
};

exports.login = async (user) => {
  try {
    const loggedInUser = await userRepository.login(user);
    return loggedInUser;
  } catch (error) {
    throw error;
  }
};

exports.logout = async (id) => {
  try {
    const loggedOutUser = await userRepository.logout(id);
    return loggedOutUser;
  } catch (error) {
    throw error;
  }
};
