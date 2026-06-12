import { Router } from 'express';
import {
    getAdminServices,
    createService,
    updateService,
    deleteService,
} from '../../controllers/admin/service.admin.controller.js';

import { verifyToken, checkRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../../generated/prisma/client.js';

const serviceAdminRouter = Router();

serviceAdminRouter.use(verifyToken, checkRoles([UserRole.ADMIN]));

serviceAdminRouter.get('/', getAdminServices);
serviceAdminRouter.post('/', createService);
serviceAdminRouter.patch('/:id', updateService);
serviceAdminRouter.delete('/:id', deleteService);

export default serviceAdminRouter;