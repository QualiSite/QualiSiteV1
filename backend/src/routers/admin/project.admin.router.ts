import { Router } from 'express';
import {
  getAdminProjects,
  createProject,
  updateProject,
  deleteProject,
  togglePublish,
} from '../../controllers/admin/project.admin.controller.js';
import { checkRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../../generated/prisma/client.js';

const projectAdminRouter = Router();

projectAdminRouter.use(checkRoles([UserRole.ADMIN]));

projectAdminRouter.get('/', getAdminProjects);
projectAdminRouter.post('/', createProject);
projectAdminRouter.patch('/:id', updateProject);
projectAdminRouter.delete('/:id', deleteProject);
projectAdminRouter.patch('/:id/publish', togglePublish);

export default projectAdminRouter;
