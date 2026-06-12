import { Router } from 'express';
import {
    getAdminContacts,
    getAdminContactById,
    updateContactStatus,
} from '../../controllers/admin/contact.admin.controller.js';
import { verifyToken, checkRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../../generated/prisma/client.js';

const contactAdminRouter = Router();

contactAdminRouter.use(verifyToken, checkRoles([UserRole.ADMIN]));

contactAdminRouter.get('/',             getAdminContacts);
contactAdminRouter.get('/:id',          getAdminContactById);
contactAdminRouter.patch('/:id/status', updateContactStatus);

export default contactAdminRouter;