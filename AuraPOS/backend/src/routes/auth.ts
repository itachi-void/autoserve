import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { Store } from '../data/store';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'AuraPOS_Super_Secret_Key_8923489234';

authRouter.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const user = Store.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid email or password.' });
  }

  const branch = Store.branches.find(b => b.id === user.branchId);
  const token = jwt.sign(
    { sub: user.id, email: user.email, role: user.role, orgId: user.orgId, branchId: user.branchId },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({
    accessToken: token,
    user: {
      id: user.id,
      orgId: user.orgId,
      branchId: user.branchId,
      branchNameEn: branch?.nameEn,
      branchNameAr: branch?.nameAr,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      language: user.language
    }
  });
});
