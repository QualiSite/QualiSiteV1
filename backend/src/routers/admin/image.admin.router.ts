import { Router } from 'express';
import { verifyToken, checkRoles } from '../../middlewares/auth.middleware.js';
import { UserRole } from '../../../generated/prisma/client.js';
import { upload } from '../../lib/upload.js';
import {
    uploadProjectImage,
    setCoverImage,
    deleteProjectImage,
} from '../../controllers/admin/image.admin.controller.js';

const imageAdminRouter = Router({ mergeParams: true });

imageAdminRouter.use(verifyToken, checkRoles([UserRole.ADMIN]));

imageAdminRouter.post('/',                upload.single('image'), uploadProjectImage);
imageAdminRouter.patch('/:imageId/cover', setCoverImage);
imageAdminRouter.delete('/:imageId',      deleteProjectImage);

export default imageAdminRouter;