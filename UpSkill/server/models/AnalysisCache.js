const mongoose = require('mongoose');
const crypto = require('crypto');

const cacheSchema = new mongoose.Schema({
    hash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    type: {
        type: String,
        enum: ['skillGap', 'rewrite', 'project', 'role', 'github'],
        required: true
    },
    result: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 * 7
    }
});

cacheSchema.statics.generateHash = function (input) {
    return crypto.createHash('sha256').update(input).digest('hex');
};

cacheSchema.statics.getCache = async function (hash, type) {
    return this.findOne({ hash, type });
};

cacheSchema.statics.setCache = async function (hash, type, result) {
    return this.findOneAndUpdate(
        { hash, type },
        { hash, type, result, createdAt: new Date() },
        { upsert: true, new: true }
    );
};

module.exports = mongoose.model('AnalysisCache', cacheSchema);
