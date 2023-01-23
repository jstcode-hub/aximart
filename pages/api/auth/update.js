import { getSession } from 'next-auth/react';
import db from '../../../utils/db';
import User from '../../../models/User';
import bcryptjs from 'bcryptjs';

async function handler(req, res) {
  if (req.method !== 'PUT') {
    return res.status(400).send({ message: `${req.method} not supported` });
  }

  const session = await getSession({ req });
  if (!session) {
    return res.status(401).send({ message: 'Masuk ke akun' });
  }

  const { user } = session;

  const { name, email, password } = req.body;

  if (!name || !email || !email.includes('@') || (password && password.trim().length < 5)) {
    res.status(422).json({
      message: 'Validasi error',
    });
    return;
  }
  await db.connect();
  const toUpdateUser = await User.findById(user._id);
  toUpdateUser.name = name;
  toUpdateUser.email = email;
  if (password) {
    toUpdateUser.password = bcryptjs.hashSync(password);
  }
  await toUpdateUser.save();
  await db.disconnect();
  res.send({
    message: 'Akun telah diperbarui',
  });
}

export default handler;
