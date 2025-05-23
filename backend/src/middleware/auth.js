const { COLLECTIONS } = require('../utils/constants');

const authenticate = async (req, reply) => {
    try {
        const token  = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return reply.status(401).send({
                success: false,
                message: 'Access token required'
            });
        }

        const decoded = req.server.jwt.verify(token);

        const db = req.server.mongo.db;
        const user = await db.collection(COLLECTIONS.USERS).findOne(
            { _id: new req.server.mongo.ObjectId(decoded.userId) },
            { projection: { password: 0 } }
        );

        if (!user) {
            return reply.status(401).send({
                success: false,
                message: 'User not found!'
            });
        }

        req.user = user;
    } catch (error) {
        req.log.error(`Authentication error: ${error}`);
        return reply.status(401).send({
            success: false,
            message: 'Invalid or expired token'
        });
    }
}

const optionalAuth = async (req, reply) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        const decoded = req.server.jwt.verify(token);
        const db = req.server.mongo.db;
        const user = await db.collection(COLLECTIONS.USERS).findOne(
          { _id: req.server.mongo.ObjectId(decoded.userId) },
          { projection: { password: 0 } }
        );

        if (user) {
          req.user = user;
        }
      }
    } catch (error) {
      req.log.debug('Optional auth failed:', error.message);
    }
  }

module.exports = {
    authenticate,
    optionalAuth
}