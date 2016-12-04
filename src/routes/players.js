// https://api.worldoftanks.ru/wot/ratings/top/?applicationid=demo&type=all&rank_field=wins_ratio
function NumberLong(n) {
    return parseInt(n);
}

function ISODate(dt) {
    return new Date(dt);
}

export const topPlayers = [
    {
        "id": NumberLong("71196252"),
        "__v": 2,
        "st": "ok",
        "dt": ISODate("2016-09-12T12:29:20.727Z"),
        "ts": 1473683360727,
        "cr": 1471997739,
        "up": 1473633626,
        "nm": "OSKAJInk",
        "wgr": 6590,
        "lang": "default",
        "rnd": {
            "e": 1360,
            "wn6": 1693
        },
        "lvl": 6.054979253112033,
        "b": 1619,
        "w": 926,
        "spo": 1464,
        "hip": 66,
        "cap": 2110,
        "dmg": 2169001,
        "frg": 2060,
        "def": 1019,
        "e": 1360,
        "wn6": 1693,
        "wn8": 1739,
        "flag": "default"
    },
    {
        "id": NumberLong("1006970370"),
        "__v": 2,
        "st": "ok",
        "dt": ISODate("2016-11-21T14:27:19.518Z"),
        "ts": 1479738439518,
        "cr": 1386469801,
        "up": 1479709653,
        "nm": "Everfalling",
        "wgr": 4155,
        "lang": "default",
        "cid": 1000023494,
        "rnd": {
            "e": 901,
            "wn6": 888
        },
        "lvl": 6.407973318855193,
        "b": 13105,
        "w": 6305,
        "spo": 16040,
        "hip": 66,
        "cap": 14522,
        "dmg": 8988188,
        "frg": 8632,
        "def": 4829,
        "e": 899,
        "wn6": 882,
        "wn8": 911,
        "flag": "default",
        "status": 1
    },
    {
        "id": NumberLong("1015634"),
        "__v": 2,
        "st": "ok",
        "dt": ISODate("2016-09-12T12:33:20.683Z"),
        "ts": 1473683600683,
        "cr": 1295454544,
        "up": 1473609096,
        "nm": "iBat",
        "wgr": 9003,
        "lang": "default",
        "cid": 208168,
        "rnd": {
            "e": 1511,
            "wn6": 1617
        },
        "lvl": 7.660819621235641,
        "b": 19445,
        "w": 11108,
        "spo": 25365,
        "hip": 70,
        "cap": 32031,
        "dmg": 29585344,
        "frg": 24631,
        "def": 16754,
        "e": 1511,
        "wn6": 1615,
        "wn8": 2238,
        "flag": "default"
    },
    {
        "id": NumberLong("2907789"),
        "__v": 2,
        "st": "ok",
        "dt": ISODate("2016-09-12T12:45:32.605Z"),
        "ts": 1473684332605,
        "cr": 1312822665,
        "up": 1473682533,
        "nm": "zavyalov33",
        "wgr": 4335,
        "lang": "default",
        "cid": 29553,
        "rnd": {
            "e": 893,
            "wn6": 840
        },
        "lvl": 6.71689471898677,
        "b": 17744,
        "w": 8563,
        "spo": 19760,
        "hip": 65,
        "cap": 21441,
        "dmg": 12347200,
        "frg": 10965,
        "def": 7477,
        "e": 892,
        "wn6": 839,
        "wn8": 872,
        "flag": "default"
    }
];
