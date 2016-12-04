import request from 'request-promise';

const appId = 'dcaa3a33c655cfc1d9daeb1a2324469a';
const updateRequired = true;

class Repository {
    constructor(entityType) {
        this.entityType = entityType;
    }

    async byId(id) {
        const wrappedPlayer = await this.getPlayers([id]);
        return wrappedPlayer[0];
    }

    async getTop() {
        const type = 'all';
        const rank = 'wins_ratio';
        let topLayerIds = null;
        // fetch from db
        if (updateRequired) {
            const httpData = await request.get({
                url: 'https://api.worldoftanks.ru/wot/ratings/top/',
                qs: {
                    application_id: appId,
                    rank_field: rank,
                    type
                },
                json: true
            });
            topLayerIds = httpData.data.map(topRecord => topRecord.account_id);
            // save to db
        }

        return this.getPlayers(topLayerIds);
    }

    async getPlayers(playerIds) {
        // fetch from db
        let players = null;
        if (updateRequired) {
            players = await Promise.all(playerIds.map(topPlayerId => {
                return Promise.all([
                    request.get({
                        url: 'https://api.worldoftanks.ru/wot/account/info/',
                        qs: {
                            application_id: appId,
                            account_id: topPlayerId
                        },
                        json: true
                    }),
                    request.get({
                        url: 'https://api.worldoftanks.ru/wot/tanks/achievements/',
                        qs: {
                            application_id: appId,
                            account_id: topPlayerId
                        },
                        json: true
                    })
                ])
            }));
            // save do db
        }
        return players;
    }
}

export const repository = {
    players: new Repository('players')
};
