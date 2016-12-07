import dynamoose from 'dynamoose';

const topPlayersSchema = new dynamoose.Schema({
    rank: { type: String, hashKey: true },
    type: { type: String, rangeKey: true },
    updatedAt: Number,
    players: [Number]
}, {
    throughput: { read: 5, write: 2 }
});

export const TopPlayers = dynamoose.model('TopPlayers', topPlayersSchema, { update: true });
