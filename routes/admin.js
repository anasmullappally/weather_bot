import express from "express";
import { addAPIKeys, api, home, startBot, stopBot, updateAPIKeys } from "../controllers/admin.js";
const adminRouter = express.Router();

// Define a route to render the index page
adminRouter.get('/', home);
adminRouter.get('/api', api);
adminRouter.post("/add-apis", addAPIKeys)
adminRouter.post("/update-apis", updateAPIKeys)
adminRouter.post("/start-bot", startBot)
adminRouter.post("/stop-bot", stopBot)

export default adminRouter;