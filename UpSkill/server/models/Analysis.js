const mongoose = require('mongoose');

/**
 * Analysis Schema
 * Stores resume analysis results and learning roadmap
 */
const analysisSchema = new mongoose.Schema({
    // Reference to the user who created this analysis
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Original resume text (extracted from uploaded file)
    resumeText: {
        type: String,
        required: true
    },

    // Job description provided by user
    jobDescription: {
        type: String,
        required: true
    },

    // Job title extracted from JD (optional)
    jobTitle: {
        type: String,
        default: 'Position'
    },

    // Skills found in both resume and JD
    matchedSkills: [{
        type: String
    }],

    // Skills in JD but not in resume
    missingSkills: [{
        type: String
    }],

    // Skills in resume but not in JD
    extraSkills: [{
        type: String
    }],

    // Match percentage (0-100)
    matchScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },

    // Learning recommendations for missing skills
    learningRoadmap: [{
        skill: {
            type: String,
            required: true
        },
        level: {
            type: String,
            enum: ['Beginner', 'Intermediate', 'Advanced'],
            default: 'Beginner'
        },
        estimatedDays: {
            type: Number,
            default: 7
        },
        resourceUrl: {
            type: String
        },
        resourceName: {
            type: String
        },
        status: {
            type: String,
            enum: ['todo', 'in-progress', 'done'],
            default: 'todo'
        }
    }],

    // Unique share ID for public access (generated on demand)
    shareId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },

    // Analysis creation timestamp
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Index for efficient user queries
analysisSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Analysis', analysisSchema);
