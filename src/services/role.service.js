const roleRepository = require("../Repository/role.repository");

exports.createRole = async (name, description, permissions) => {
  try {
    const role = await roleRepository.createRole(
      name,
      description,
      permissions
    );
    return role;
  } catch (error) {
    throw error;
  }
};

exports.getAllRoles = async (page = 1, limit = 10) => {
  try {
    const skip = (page - 1) * limit;

    const [roles, totalRecords] = await Promise.all([
      roleRepository.getAllRoles(skip, limit),
      roleRepository.countRoles()
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      roles,
      totalRoles: totalRecords,
      page,
      totalPages
    };
  } catch (error) {
    throw error;
  }
};

exports.getRoleByName = async (name) => {
  try {
    const role = await roleRepository.getRoleByName(name);
    return role;
  } catch (error) {
    throw error;
  }
};

exports.updateRole = async (name, roleData) => {
  try {
    const role = await roleRepository.updateRole(name, roleData);
    return role;
  } catch (error) {
    throw error;
  }
};

exports.deleteRoleByName = async (name) => {
  try {
    const role = await roleRepository.deleteRoleByName(name);
    return role;
  } catch (error) {
    throw error;
  }
};
