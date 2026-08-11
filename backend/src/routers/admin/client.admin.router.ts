import { Router } from 'express';
import { checkRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../../generated/prisma/client.js';
import {
  getAdminClients,
  getAdminClientById,
  createClient,
  updateClient,
  deleteClient,
} from '../../controllers/admin/client.admin.controller.js';

const clientAdminRouter = Router();

clientAdminRouter.use(checkRoles([UserRole.ADMIN]));

clientAdminRouter.get('/', getAdminClients);
clientAdminRouter.get('/:id', getAdminClientById);
clientAdminRouter.post('/', createClient);
clientAdminRouter.patch('/:id', updateClient);
clientAdminRouter.delete('/:id', deleteClient);

export default clientAdminRouter;
