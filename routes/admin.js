import express from 'express';
import { addAPIKeys, getApi, getUsers, getHome, startBot, stopBot, toggleBlock, updateAPIKeys } from '../controllers/admin.js';
const router = express.Router();

// Define a route to render the index page
router.get('/', getHome);
router.get('/api', getApi);
router.post('/api', addAPIKeys)
router.put('/api', updateAPIKeys)
router.post('/start-bot', startBot)
router.post('/stop-bot', stopBot)
router.get('/users', getUsers)
router.put('/users/toggle-block', toggleBlock)

export default router;