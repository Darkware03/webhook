import { Router } from 'express';
import Call from '../../app/utils/Call.mjs';
import TipoRolController from '../../app/controllers/TipoRolController.mjs';

const router = Router();
router.get('/', [], Call(TipoRolController.index));

export default router;
