jest.mock("../../../utils/response");

const RoleController = require("../../../controllers/role.controller");
const RoleService = require("../../../services/role.service");
const responseUtils = require("../../../utils/response");
const AppError = require("../../../utils/appError");

describe("RoleController", () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    req = { body: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
    responseUtils.formatResponse.mockImplementation((res, data) => data);
  });

  describe("createRole", () => {
    it("should create role and return success response", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };
      const createdRole = { _id: "12345", ...roleData, createdAt: new Date() };
      req.body = roleData;

      RoleService.createRole.mockResolvedValue(createdRole);
      const successResponse = {
        status: "success",
        message: "Role created successfully",
        data: createdRole,
        timestamp: expect.any(String)
      };
      responseUtils.success.mockReturnValue(successResponse);

      await RoleController.createRole(req, res, next);

      expect(RoleService.createRole).toHaveBeenCalledWith({
        name: roleData.name,
        permissions: roleData.permissions
      });
      expect(responseUtils.success).toHaveBeenCalledWith(
        createdRole,
        "Role created successfully"
      );
      expect(responseUtils.formatResponse).toHaveBeenCalledWith(
        res,
        successResponse
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(successResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it("should throw AppError if name is missing", async () => {
      req.body = { permissions: ["read", "write"] };

      await RoleController.createRole(req, res, next);

      expect(next).toHaveBeenCalledWith(expect.any(AppError));
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Role name is required",
          statusCode: 400
        })
      );
      expect(RoleService.createRole).not.toHaveBeenCalled();
      expect(responseUtils.success).not.toHaveBeenCalled();
    });

    it("should call next with error from RoleService", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };
      req.body = roleData;

      const error = new AppError("Role editor already exists", 400);
      RoleService.createRole.mockRejectedValue(error);

      await RoleController.createRole(req, res, next);

      expect(RoleService.createRole).toHaveBeenCalledWith({
        name: roleData.name,
        permissions: roleData.permissions
      });
      expect(next).toHaveBeenCalledWith(error);
      expect(responseUtils.success).not.toHaveBeenCalled();
    });
  });
});
