import { Router } from 'express';
import bcrypt from 'bcrypt';
import { User } from '../models/User';
import { Organization } from '../models/Organization';
import { signAuthToken } from '../middleware/auth';

const router = Router();

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, organizationName } = req.body;

    if (!name || !email || !password || !organizationName) {
      return res.status(400).json({ error: { message: 'name, email, password, and organizationName are required' } });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({ error: { message: 'Email is already registered' } });
    }

    let organization = await Organization.findOne({ name: organizationName.trim() });
    if (!organization) {
      organization = await Organization.create({ name: organizationName.trim() });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      organizationId: organization._id
    });

    const token = signAuthToken({
      id: user._id.toString(),
      email: user.email,
      organizationId: user.organizationId.toString()
    });

    res.status(201).json({
      token,
      user: {
        name: user.name,
        email: user.email,
        organizationId: user.organizationId,
        organizationName: organization.name
      }
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: { message: 'email and password are required' } });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: { message: 'Invalid email or password' } });
    }

    const organization = await Organization.findById(user.organizationId);
    const token = signAuthToken({
      id: user._id.toString(),
      email: user.email,
      organizationId: user.organizationId.toString()
    });

    res.json({
      token,
      user: {
        name: user.name,
        email: user.email,
        organizationId: user.organizationId.toString(),
        organizationName: organization?.name
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
