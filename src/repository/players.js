import dynamoose from 'dynamoose';

const topPlayersSchema = new dynamoose.Schema({
    rank: { type: String, hashKey: true },
    type: { type: String, rangeKey: true },
    players: Array
    // account_id: { type: Number, hashKey: true },
    // wins_ratio: Number,
    // global_rating: Number
}, {
    throughput: { read: 5, write: 2 },
    timestamps: true
});

export default dynamoose.model('TopPlayers', topPlayersSchema, { update: true });
