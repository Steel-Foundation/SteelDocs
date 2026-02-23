import { httpRouter } from "convex/server";
// Auth disabled temporarily
// import { authComponent, createAuth } from "./auth";

const http = httpRouter();

// authComponent.registerRoutes(http, createAuth);

export default http;
