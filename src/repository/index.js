import request from 'request-promise';
import { TopPlayers, Player } from './models';
import { playerFromHttp } from './models/player';
import { logError } from '../utils';

const appId = 'dcaa3a33c655cfc1d9daeb1a2324469a';
const updateTopTrashHold = 30 * 60 * 1000;
const updatePlayerTrashHold = 60 * 60 * 1000;

class Repository {
    constructor(entityType) {
        this.entityType = entityType;
    }

    async byId(id) {
        const wrappedPlayer = await this.getPlayers([id]);
        return wrappedPlayer[0];
    }

    async getTop(rank) {
        const type = 'all';
        const topPlayersDoc = await TopPlayers.get({ type, rank });
        const now = Date.now();

        if (topPlayersDoc && topPlayersDoc.updatedAt + updateTopTrashHold > now) {
            return this.getPlayers(topPlayersDoc.players);
        }

        const httpData = await request.get({
            url: 'https://api.worldoftanks.ru/wot/ratings/top/',
            qs: {
                application_id: appId,
                rank_field: rank,
                type
            },
            json: true
        });
        const topLayerIds = httpData.data.map(topRecord => topRecord.account_id);

        await TopPlayers.update({ type, rank }, { players: topLayerIds, updatedAt: now });

        return this.getPlayers(topLayerIds);
    }

    async getPlayers(playerIds) {
        const playersDocs = await Player.batchGet(playerIds.map(id => { return { id: id }}));
        const result = [ ];
        const reservedPlayers = { };
        const idsToUpdate = [...playerIds];
        const now = Date.now();

        playersDocs.forEach(playerDoc => {
            if (playerDoc.updatedAt + updatePlayerTrashHold > now) {
                result.push(playerDoc);
                idsToUpdate.splice(idsToUpdate.indexOf(playerDoc.id), 1);
            } else {
                reservedPlayers[playerDoc.id] = playerDoc;
            }
        });
        if (idsToUpdate.length) {
            const [ accountInfoResult, achievementsResult, tankStatsResult ] = await Promise.all([
                request.get({
                    url: 'https://api.worldoftanks.ru/wot/account/info/',
                    qs: {
                        application_id: appId,
                        account_id: idsToUpdate.join(','),
                        fields: 'nickname,created_at,updated_at,statistics,global_rating,client_language,clan_id'
                    },
                    json: true
                }),
                Promise.all(idsToUpdate.map(id => {
                    return request.get({
                        url: 'https://api.worldoftanks.ru/wot/tanks/achievements/',
                        qs: {
                            application_id: appId,
                            account_id: id,
                            fields: 'achievements,tank_id'
                        },
                        json: true
                    })
                })),
                Promise.all(idsToUpdate.map(id => {
                    return request.get({
                        url: 'https://api.worldoftanks.ru/wot/tanks/stats/',
                        qs: {
                            application_id: appId,
                            account_id: id
                        },
                        json: true
                    })
                }))
                /*,
                request.get({
                    url: 'https://api.worldoftanks.ru/wot/account/tanks/',
                    qs: {
                        application_id: appId,
                        account_id: idsToUpdate.join(',')
                    },
                    json: true
                })*/
            ]);

            await Promise.all(idsToUpdate.map(async (playerId, idx) => {
                try {
                    const accountInfo = accountInfoResult.data[playerId];
                    const achievements = achievementsResult[idx].data[playerId];
                    const tankStats = tankStatsResult[idx].data[playerId];
                    const player = playerFromHttp(playerId, accountInfo, tankStats);

                    // vehicles from HTTP
                    await player.save();
                    result.push(player);
                } catch (e) {
                    if (reservedPlayers[playerId]) {
                        result.push(reservedPlayers[playerId]);
                    }
                }
            }));
        }
        return result;
    }
}

export const repository = {
    players: new Repository('players')
};
