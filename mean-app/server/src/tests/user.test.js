import { jest } from "@jest/globals";
import request from "supertest";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createTestApp } from "./app.test-server.js";

// Mock model and auth middleware for protected routes
jest.unstable_mockModule("../api/modules/user/user.model.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
  },
}));

jest.unstable_mockModule("../api/middleware/auth.js", () => ({
  default: (req, res, next) => {
    req.user = { id: "u1", role: "user" };
    next();
  },
}));

// Ensure JWT secret defined for auth middleware verification path
process.env.JWT_SECRET = process.env.JWT_SECRET || "testsecret";

const { default: User } = await import("../api/modules/user/user.model.js");
const { default: userService } = await import("../api/modules/user/user.service.js");

describe("User API", () => {
  let app;

  beforeAll(async () => {
    app = await createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // -------- AUTH --------
  test("POST /api/auth/signup creates user", async () => {
    const createdUser = { _id: "u1", name: "A", email: "a@b.com" };
    jest.spyOn(User, "findOne").mockResolvedValue(null);
    jest.spyOn(bcrypt, "hash").mockResolvedValue("hashed");
    jest.spyOn(User, "create").mockResolvedValue(createdUser);

    const res = await request(app)
      .post("/api/auth/signup")
      .send({ name: "A", email: "a@b.com", password: "pw" });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual(createdUser);
  });

  test("POST /api/auth/login returns token and user", async () => {
    const user = { _id: "u1", email: "a@b.com", password: "hashed", role: "user" };
    jest.spyOn(User, "findOne").mockResolvedValue(user);
    jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
    jest.spyOn(jwt, "sign").mockReturnValue("token123");

    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "a@b.com", password: "pw" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBe("token123");
    expect(res.body.user).toMatchObject({ _id: "u1", email: "a@b.com" });
  });

  // -------- PROFILE --------
  test("GET /api/profile returns user profile", async () => {
    jest.spyOn(userService, "getProfile").mockResolvedValue({ _id: "u1", name: "A" });
    const res = await request(app).get("/api/profile").set("Authorization", "Bearer t");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user).toEqual({ _id: "u1", name: "A" });
  });

  test("PUT /api/profile updates profile", async () => {
    jest.spyOn(userService, "updateProfile").mockResolvedValue({ _id: "u1", name: "B" });
    const res = await request(app)
      .put("/api/profile")
      .set("Authorization", "Bearer t")
      .send({ name: "B" });
    expect(res.status).toBe(200);
    expect(res.body.user).toEqual({ _id: "u1", name: "B" });
  });

  test("DELETE /api/profile deletes profile", async () => {
    jest.spyOn(userService, "deleteProfile").mockResolvedValue({ _id: "u1" });
    const res = await request(app)
      .delete("/api/profile")
      .set("Authorization", "Bearer t");
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/deleted/i);
  });

  // -------- PASSWORD --------
  test("PUT /api/profile/password requires both fields", async () => {
    const res = await request(app)
      .put("/api/profile/password")
      .set("Authorization", "Bearer t")
      .send({ currentPassword: "a" });
    expect(res.status).toBe(400);
  });

  test("PUT /api/profile/password updates password", async () => {
    jest.spyOn(userService, "updatePassword").mockResolvedValue({ _id: "u1" });
    const res = await request(app)
      .put("/api/profile/password")
      .set("Authorization", "Bearer t")
      .send({ currentPassword: "old", newPassword: "new" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/success/i);
  });
});


