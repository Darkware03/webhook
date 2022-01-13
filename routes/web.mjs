import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.send('<h1 style="color:red">Welcome</h1>');
});

export default router;
