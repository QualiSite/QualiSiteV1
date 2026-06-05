import { Router } from 'express';
import { getProjects, getProjectById } from '../controllers/project.controller.js';

const router = Router();

router.get('/projects', getProjects);
router.get('/projects/:id', getProjectById);

export default router;