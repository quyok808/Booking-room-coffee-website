const RoleRepository = require("../../../Repository/role.repository");
const Role = require("../../../models/role.model");
const AppError = require("../../../utils/appError");

// Mock Role model
jest.mock("../../../models/role.model");

describe("RoleRepository", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("findByName", () => {
    it("should return role if found", async () => {
      const role = {
        _id: "12345",
        name: "editor",
        permissions: ["read", "write"]
      };
      Role.findOne.mockResolvedValue(role);

      const result = await RoleRepository.findByName("editor");

      expect(Role.findOne).toHaveBeenCalledWith({ name: "editor" });
      expect(result).toEqual(role);
    });

    it("should return null if role not found", async () => {
      Role.findOne.mockResolvedValue(null);

      const result = await RoleRepository.findByName("nonexistent");

      expect(Role.findOne).toHaveBeenCalledWith({ name: "nonexistent" });
      expect(result).toBeNull();
    });
  });

  describe("create", () => {
    it("should create and return new role", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };
      const createdRole = { _id: "12345", ...roleData, createdAt: new Date() };
      Role.create.mockResolvedValue(createdRole);

      const result = await RoleRepository.create(roleData);

      expect(Role.create).toHaveBeenCalledWith(roleData);
      expect(result).toEqual(createdRole);
    });
  });
});
