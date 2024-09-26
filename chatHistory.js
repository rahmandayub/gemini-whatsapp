const db = require('./database');

module.exports = {
    getHistory: (userId) => {
        return new Promise((resolve, reject) => {
            db.all(
                'SELECT * FROM chat_history WHERE user_id = ? ORDER BY created_at ASC',
                [userId],
                (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(
                            rows.map((row) => ({
                                role: row.role,
                                parts: [{ text: row.message }],
                            }))
                        );
                    }
                }
            );
        });
    },

    addMessage: (userId, message, role, name) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)',
                [userId, role, message],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    },

    errorTemplateMessage: (userId, message) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)',
                [userId, 'user', message],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        db.run(
                            'INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)',
                            [userId, 'model', 'Astaghfirullah 😌'],
                            (err) => {
                                if (err) {
                                    reject(err);
                                } else {
                                    resolve();
                                }
                            }
                        );
                    }
                }
            );
        });
    },

    addGeminiVisionChat: (userId, message, role) => {
        return new Promise((resolve, reject) => {
            db.run(
                'INSERT INTO chat_history (user_id, role, message) VALUES (?, ?, ?)',
                [userId, role, message],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    },

    clearLastTwo: (userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM chat_history WHERE user_id = ? AND id IN (SELECT id FROM chat_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 2)',
                [userId, userId],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                }
            );
        });
    },

    clearHistory: (userId) => {
        return new Promise((resolve, reject) => {
            db.run(
                'DELETE FROM chat_history WHERE user_id = ?',
                [userId],
                (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        console.log('Chat history cleared');
                        resolve();
                    }
                }
            );
        });
    },

    clearAllHistory: () => {
        return new Promise((resolve, reject) => {
            db.run('DELETE FROM chat_history', (err) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('All chat history cleared');
                    resolve();
                }
            });
        });
    },
};
