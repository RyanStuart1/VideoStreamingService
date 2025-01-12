const bcrypt = require('bcryptjs'); // Use bcryptjs instead of bcrypt

const hashPassword = (password) => {
    return new Promise((resolve, reject) => {
        bcrypt.genSalt(12, (err, salt) => {
            if (err) {
                reject(err);
            }
            bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    reject(err);
                }
                resolve(hash);
            });
        });
    });
};

const comparePassword = (password, hashed) => {
    return bcrypt.compare(password, hashed); // Works the same way as bcrypt
};

module.exports = {
    hashPassword,
    comparePassword,
};
