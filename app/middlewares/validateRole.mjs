import Security from '../services/security.mjs';
import Handler from '../../handlers/Handler.mjs';
import ForbiddenException from '../../handlers/ForbiddenException.mjs';

const validateRole = (ROLE) => async (req, res, next) => {
  const valid = await Security.isGranted(req, ROLE);
  if (valid) next();
  else Handler.handlerError(new ForbiddenException(), req, res, next);
};

export default validateRole;
