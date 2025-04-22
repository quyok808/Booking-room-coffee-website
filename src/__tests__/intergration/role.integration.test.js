const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const roleRoutes = require("../../routers/role.route");
const { protect, restrictTo } = require("../../middlewares/auth.middleware");
const responseUtils = require("../../utils/response");
const AppError = require("../../utils/appError");
const Role = require("../../models/role.model");

jest.mock("../../middlewares/auth.middleware");

describe("Role Integration Tests", () => {
  let app;

  beforeAll(async () => {
    jest.setTimeout(10000); // Tăng timeout
    app = express();
    app.use(express.json());
    app.use("/api", roleRoutes);

    protect.mockImplementation((req, res, next) => {
      req.user = { _id: "12345", role: "admin" };
      next();
    });
    restrictTo.mockImplementation(() => (req, res, next) => next());

    app.use(require("../../middlewares/error.middleware"));
  });

  beforeEach(async () => {
    await Role.deleteMany({ name: { $in: ["editor", "admin", "user"] } });
  }, 10000);

  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe("POST /api/roles", () => {
    it("should create a new role and return 200", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };

      const response = await request(app)
        .post("/api/roles")
        .send(roleData)
        .expect(200);

      expect(response.body).toMatchObject({
        status: "success",
        message: "Role created successfully",
        data: {
          name: "editor",
          permissions: ["read", "write"],
          _id: expect.any(String),
          createdAt: expect.any(String)
        },
        timestamp: expect.any(String)
      });

      const roleInDb = await Role.findOne({ name: "editor" });
      expect(roleInDb).toBeTruthy();
      expect(roleInDb.permissions).toEqual(["read", "write"]);
    });

    it("should return 400 if role already exists", async () => {
      const roleData = { name: "editor", permissions: ["read", "write"] };
      await Role.create(roleData);

      const response = await request(app)
        .post("/api/roles")
        .send(roleData)
        .expect(400);

      expect(response.body).toMatchObject({
        status: "fail",
        message: "Role editor already exists",
        errorCode: "APP_ERROR",
        statusCode: 400,
        timestamp: expect.any(String)
      });
    });

    it("should return 400 if name is missing", async () => {
      const response = await request(app)
        .post("/api/roles")
        .send({ permissions: ["read", "write"] })
        .expect(400);

      expect(response.body).toMatchObject({
        status: "fail",
        message: "Role name is required",
        errorCode: "APP_ERROR",
        statusCode: 400,
        timestamp: expect.any(String)
      });
    });
  });
});
