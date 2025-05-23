const bcrypt = require('bcryptjs');
const { COLLECTIONS } = require('../utils/constants');

const register = async (req, reply, fastify) => {
    try {
        const { name, email, password, country, role } = req.body;
        const db = fastify.mongo.db;


        const existingUser = await db.collection(COLLECTIONS.USERS).findOne({ email });
        console.log(existingUser);

        if (existingUser) {
            return reply.status(409).send({
                success: false,
                message: 'User already exists!'
            })
        }

        const hashPassword = await bcrypt.hash(password, 12);

        const newUser = {
            name, email,
            password: hashPassword, country, role,
            createdAt: new Date(),
            updatedAt: new Date()
        }
        console.log(await db.collection(COLLECTIONS.USERS));


        const result = await db.collection(COLLECTIONS.USERS).insertOne(newUser);

        const token = fastify.jwt.sign({
            userId: result.insertedId.toString(),
            email: newUser.email,
            role: newUser.role,
            country: newUser.country
        });

        const { password: _, ...userResponse } = newUser;
        userResponse._id = result.insertedId;

        return reply.status(201).send({
            success: true,
            message: 'User registered successfully',
            data: {
              user: userResponse,
              token
            }
        });
    } catch (error) {
        fastify.log.error(`Registration error: ${error}`);
        return reply.status(500).send({
            success: false,
            message: 'Failed to register user'
        })
    }
};

const login = async (req, reply, fastify) => {
    try {
        const { email, password } = req.body;
        const db = fastify.mongo.db;

        const user = await db.collection(COLLECTIONS.USERS).findOne({
            email: email.toLowerCase()
        });

        if (!user) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid email'
            })
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return reply.status(401).send({
                success: false,
                message: 'Invalid password'
            })
        }

        const token = fastify.jwt.sign({
            userId: user._id.toString(),
            email: user.email,
            role: user.role,
            country: user.country
        });

        const { password: _, _id, ...userResponse } = user;

        return reply.send({
            success: true,
            message: 'Login successful',
            data: {
                user: userResponse,
                token
            }
        });
    } catch (error) {
        fastify.log.error(`Login error: ${error}`);
        return reply.status(500).send({
            success: false,
            message: 'Failed to login'
        });
    }
}

const getProfile = async (req, reply, fastify) => {
    try {
        return reply.send({
            success: true,
            data: {
                user: req.user
            }
        });
    } catch (error) {
        fastify.log.error(`Error fetching profile: ${error}`);
        return reply.status(500).send({
            success: false,
            message: 'Failed to fetch profile'
        })
    }
}

const updateProfile = async (req, reply, fastify) => {
    try {
        const db = fastify.mongo.db;
        const userId = req.user._id;
        const updateData = {...req.body, updatedAt: new Date()};

        if (updateData.email) {
          const existingUser = await db.collection(COLLECTIONS.USERS).findOne({
            email: updateData.email.toLowerCase(),
            _id: { $ne: new fastify.mongo.ObjectId(userId) }
          });

          if (existingUser) {
            return reply.status(409).send({
              success: false,
              message: 'Email already exists'
            });
          }

          updateData.email = updateData.email.toLowerCase();
        }

        const result = await db.collection(COLLECTIONS.USERS).findOneAndUpdate(
          { _id: new fastify.mongo.ObjectId(userId) },
          { $set: updateData },
          { returnDocument: 'after', projection: { password: 0, _id: 0  } }
        );

        if (!result) {
          return reply.status(404).send({
            success: false,
            message: 'User not found'
          });
        }

        return reply.send({
          success: true,
          message: 'Profile updated successfully',
          data: {
            user: result
          }
        });

    } catch (error) {
        fastify.log.error(`Profile update error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to update profile'
        });
    }
}

const changePassword = async (req, reply, fastify) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
          return reply.status(400).send({
            success: false,
            message: 'Current password and new password are required'
          });
        }

        if (newPassword.length < 6) {
          return reply.status(400).send({
            success: false,
            message: 'New password must be at least 6 characters long'
          });
        }

        const db = fastify.mongo.db;
        const userId = req.user._id;

        const user = await db.collection(COLLECTIONS.USERS).findOne({
          _id: new fastify.mongo.ObjectId(userId)
        });

        const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isCurrentPasswordValid) {
          return reply.status(401).send({
            success: false,
            message: 'Current password is incorrect'
          });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 12);

        await db.collection(COLLECTIONS.USERS).updateOne(
          { _id: new fastify.mongo.ObjectId(userId) },
          {
            $set: {
              password: hashedNewPassword,
              updatedAt: new Date()
            }
          }
        );

        return reply.send({
          success: true,
          message: 'Password changed successfully'
        });

      } catch (error) {
        fastify.log.error('Password change error:', error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to change password'
        });
      }
}

const logout = async (req, reply, fastify) => {
    try {
        return reply.send({
          success: true,
          message: 'Logged out successfully'
        });
      } catch (error) {
        fastify.log.error('Logout error:', error);
        return reply.status(500).send({
          success: false,
          message: 'Failed to logout'
        });
      }
}

const verifyToken = async (req, reply, fastify) => {
    try {
        return reply.send({
          success: true,
          message: 'Token is valid',
          data: {
            user: req.user
          }
        });
    } catch (error) {
        fastify.log.error(`Token verification error: ${error}`);
        return reply.status(500).send({
          success: false,
          message: 'Failed to verify token'
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
    updateProfile,
    changePassword,
    logout,
    verifyToken,
}
