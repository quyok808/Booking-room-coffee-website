const roleModel = require("../models/role.model");

exports.getAllRoles = async (skip, limit) => {
  try {
    const roles = await roleModel.find().skip(skip).limit(limit);
    return roles;
  } catch (error) {
    throw error;
  }
};

exports.countRoles = async () => {
  return await roleModel.countDocuments();
};

exports.createRole = async (name, description, permissions) => {
  try {
    name = name.toLowerCase();
    const role = await roleModel.create({ name, description, permissions });
    return role;
  } catch (error) {
    throw error;
  }
};

exports.getRoleByName = async (name) => {
  try {
    const role = await roleModel.findOne({
      name: new RegExp(`^${name}$`, "i")
    });
    return role;
  } catch (error) {
    throw error;
  }
};

exports.updateRole = async (name, roleData) => {
  try {
    roleData.permissions = roleData.permissions.map((item) =>
      item.toLowerCase()
    );
    const role = await roleModel.findOneAndUpdate(
      {
        name: new RegExp(`^${name}$`, "i")
      },
      roleData,
      {
        new: true,
        runValidators: true
      }
    );
    return role;
  } catch (error) {
    throw error;
  }
};

exports.deleteRoleByName = async (name) => {
  try {
    const role = await roleModel.findOneAndDelete({
      name: new RegExp(`^${name}$`, "i")
    });
    return role;
  } catch (error) {
    throw error;
  }
};
