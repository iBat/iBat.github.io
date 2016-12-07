import dynamoose from 'dynamoose';
import * as statUtils from '../../utils/stat';

const playerSchema = new dynamoose.Schema({
    id: { type: Number, hashKey: true },
    b: Number,
    cap: Number,
    cid: Number,
    def: Number,
    dmg: Number,
    e: Number,
    frg: Number,
    hip: Number,
    lang: String,
    lvl: Number,
    nm: { type: String },
    spo: Number,
    updatedAt: Number,
    w: Number,
    wgr: Number,
    wn8: Number
}, {
    throughput: { read: 5, write: 2 }
});

export const Player = dynamoose.model('Player', playerSchema, { update: true });

export function playerFromHttp(playerId, accountInfo, tankStats) {
    const result = {};

    result.id = playerId;
    result.updatedAt = Date.now();
    result.nm = accountInfo.nickname;
    result.wgr = accountInfo.global_rating;
    result.lang = accountInfo.client_language;
    result.lvl = statUtils.calculateAvgLevel(tankStats);
    result.wn8 = statUtils.calculateWN8(tankStats);

    if (accountInfo.clan_id) {
        result.cid = accountInfo.clan_id;
    }

    setStat(result, accountInfo.statistics, 'all');

    return new Player(result);
}

function setStat(destination, source, type) {
    const dest = type === 'all' ? destination : {};

    dest.b = source[type].battles;
    dest.w = source[type].wins;
    dest.spo = source[type].spotted;
    dest.hip = source[type].hits_percents;
    dest.cap = source[type].capture_points;
    dest.dmg = source[type].damage_dealt;
    dest.frg = source[type].frags;
    dest.def = source[type].dropped_capture_points;

    dest.e = statUtils.calculateEfficiency(dest, destination.lvl);
    dest.wn6 = statUtils.calculateWN6(dest, destination.lvl);

    return dest;
}