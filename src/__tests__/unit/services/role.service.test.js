jest.mock("../../../Repository/role.repository");

const RoleService = require("../../../services/role.service");
const RoleRepository = require("../../../Repository/role.repository");
const AppError = require("../../../utils/appError");

describe("RoleService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createRole", () => {
    it("should create a new role successfully", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };
      const createdRole = { _id: "12345", ...roleData, createdAt: new Date() };

      RoleRepository.create.mockResolvedValue(createdRole);

      const result = await RoleService.createRole(roleData);

      expect(RoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(RoleRepository.create).toHaveBeenCalledWith(roleData);
      expect(result).toEqual(createdRole);
    });

    it("should throw AppError if role already exists", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };
      const existingRole = { _id: "12345", name: "editor" };

      await expect(RoleService.createRole(roleData)).rejects.toThrow(AppError);
      await expect(RoleService.createRole(roleData)).rejects.toMatchObject({
        message: "Role editor already exists",
        statusCode: 400
      });
      expect(RoleRepository.findByName).toHaveBeenCalledWith(roleData.name);
      expect(RoleRepository.create).not.toHaveBeenCalled();
    });
  });
});
