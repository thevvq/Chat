const mongoose = require('mongoose')
const generate = require('../helper/generate')

const accountSchema = new mongoose.Schema(
    {
        fullName: String,
        email: String,
        password: String,
        numberPhone: String,
        token: {
            type: String,
            default: generate.generateRandomToken(20)
        },
        avatar: {
            type: String,
            default: '/images/default-avatar.jpg'
        },
        friendRequests: Array,
        friendAccepts: Array,
        friendsList: [
            {
                user_id: String,
                room_chat_id: String
            }
        ],
        deleted: {
            type: Boolean,
            default: false
        },
        deleted_at: Date
    },
    {
        timestamps: true
    }
)

const Account = mongoose.model('Accounts', accountSchema, 'accounts')

module.exports = Account