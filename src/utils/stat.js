import request from 'request-promise';
import { logWarn } from '../utils';

const tanksList = { };
const tanksExpected = { };

export async function init() {
    await loadTanksList();
    await loadTanksExpected();
}

async function loadTanksList() {
    const rawTanksList = await request.get({
        url: 'http://api.worldoftanks.eu/wot/encyclopedia/vehicles/',
        qs: {
            application_id: 'demo', // TODO appId
            fields: 'tank_id,tier,type,short_name'
        },
        json: true
    });

    for (let tankId in rawTanksList.data) {
        const tank = rawTanksList.data[tankId];

        tanksList[tank.tank_id] = {
            name: tank.short_name,
            level: tank.tier,
            type: getVehicleType(tank.type)
        };
    }
}

async function loadTanksExpected() {
    const responseData = await request.get({
        url: "http://www.wnefficiency.net/exp/expected_tank_values_latest.json",
        json: true
    });

    responseData.data.forEach(function(tankData) {
        tanksExpected[tankData.IDNum] = {
            IDNum: parseFloat(tankData.IDNum),
            expFrag: parseFloat(tankData.expFrag),
            expDamage: parseFloat(tankData.expDamage),
            expSpot: parseFloat(tankData.expSpot),
            expDef: parseFloat(tankData.expDef),
            expWinRate: parseFloat(tankData.expWinRate)
        };
    });
}

export function calculateAvgLevel(vehicles) {
    let level_battles = 0;
    let total_battles = 0;

    for (let vehicle of vehicles) {
        const tank = tanksList[vehicle.tank_id];
        const battles = vehicle.all.battles;

         if (!tank) {
            continue;
         }

        level_battles += tank.level * battles;
        total_battles += battles;
    }

    return total_battles <= 0 ? 0 : level_battles / total_battles;
}

// EFF - wot-news efficiency rating
// EFF formula:
// DAMAGE * (10 / (TIER + 2)) * (0.23 + 2 * TIER / 100)
// + FRAGS * 0.25 * 1000
// + SPOT * 0.15 * 1000 +
// + LOG((CAP + 1), 1.732) * 0.15 * 1000
// + DEF * 0.15 * 1000
export function calculateEfficiency(player, lvl) {
    if (!player.b || player.b <= 0) {
        return 0;
    }

    var FRAGS = player.frg / player.b,
        DAMAGE = player.dmg / player.b,
        SPOT = player.spo / player.b,
        CAP = player.cap / player.b,
        DEF = player.def / player.b;

    return Math.round(
        DAMAGE * (10 / (lvl + 2)) * (0.23 + lvl / 50) +
        FRAGS * 250 +
        SPOT * 150 +
        Math.log(CAP + 1) * 273.086351488 +
        DEF * 150
    );
}

// WN - WN rating http://forum.worldoftanks.com/index.php?/topic/184017-
// Current: WN6
// http://forum.worldoftanks.com/index.php?/topic/184017-/page__st__1080__pid__3542824#entry3542824
// WN6 formula:
// (1240-1040/(MIN(TIER,6))^0.164)*FRAGS
// +DAMAGE*530/(184*e^(0.24*TIER)+130)
// +SPOT*125
// +MIN(DEF,2.2)*100
// +((185/(0.17+e^((WINRATE-35)*-0.134)))-500)*0.45
// +(6-MIN(TIER,6))*-60
export function calculateWN6(player, lvl) {
    if (!player.b || player.b <= 0) {
        return 0;
    }

    var TIER_N = Math.min(6, lvl),
        FRAGS = player.frg / player.b,
        DAMAGE = player.dmg / player.b,
        SPOT = player.spo / player.b,
        DEF = Math.min(2.2, player.def / player.b),
        WINRATE = player.w / player.b * 100;

    var wn = Math.max(
        1,
        Math.round(
            (1240 - 1040 / Math.pow(TIER_N, 0.164)) * FRAGS +
            DAMAGE * 530 / (184 * Math.exp(0.24 * lvl) + 130) +
            SPOT * 125 +
            DEF * 100 +
            ((185 / (0.17 + Math.exp((WINRATE - 35) * -0.134))) - 500) * 0.45 +
            (6 - TIER_N) * -60
        )
    );

    return wn || 0;
}

//Step 1
//rDAMAGE = avgDmg / expDmg
//rSPOT = avgSpot / expSpot
//rFRAG = avgFrag / expFrag
//rDEF = avgDef / expDef
//rWIN = avgWinRate / expWinRate
//
//Step 1 takes the counts of tanks played on account, and multiplies them by the expected stats to get the account total expected values. Then the actual account totals (your total dmg, frags, spots, def, win-rate) are divided by the expected values to give the ratios.
//
//
//    Step 2
//rWINc = max(0, (rWIN - 0.71) / (1- 0.71))
//rDAMAGEc= max(0, (rDAMAGE-0.22) / (1-0.22))
//rFRAGc = min(rDAMAGEc+0.2 , max(0, (rFRAG-0.12) / (1-0.12)))
//rSPOTc = min (rDAMAGEc+0.1 ,  max(0, (rSPOT-0.38) / (1-0.38)))
//rDEFc = min (rDAMAGEc+0.1 , max(0, (rDEF-0.10) / (1-0.10)))
//Step 2 sets the zero point for the ratios. See the assumptions section for more info on why this happen. min  and max are functions to ensure the ratios stay within bounds. The constants are in the format of
//(rSTAT – constant ) / (1 – constant)
//To normalize that a player with all rSTATc of 1 would receive 1500 WN8.
//
//
//    Step 3
//WN8 = 980*rDAMAGEc + 210*rDAMAGEc*rFRAGc + 155*rFRAGc*rSPOTc + 75*rDEFc*rFRAGc + 145*MIN(1.8,rWINc)
//Step 3 takes the weighted (in Step 1) and normalized (in step 2) performance ratios and processes them through the coefficients determined for the final formula, reported above. This puts the scale on the more meaningful 0-5000, gives the relative weights of damage and reflects the interactions between frags*spots, def*frags and dmg*frags.
export function calculateWN8(vehicles) {
    const statField = 'all';
    let totalDmg = 0;
    let totalSpo = 0;
    let totalFrg = 0;
    let totalDef = 0;
    let expected = {
            dmg: 0,
            spot: 0,
            frg: 0,
            def: 0,
            win: 0
        },
        win = 0;


    for (let vehicle of vehicles) {
        const exp = tanksExpected[vehicle.tank_id];

        if (!exp) {
            logWarn(`[ALARM] no expected data for WN8. tank ${vehicle.tank_id}`);
            continue;
        }

        totalDmg += vehicle[statField].damage_dealt;
        totalSpo += vehicle[statField].spotted;
        totalFrg += vehicle[statField].frags;
        totalDef += vehicle[statField].dropped_capture_points;
        
        const battles = vehicle[statField].battles;

        expected.dmg += battles * exp.expDamage;
        expected.spot += battles * exp.expSpot;
        expected.frg += battles * exp.expFrag;
        expected.def += battles * exp.expDef;
        expected.win += battles * exp.expWinRate;
        win += vehicle[statField].wins;
    }

    win *= 100;

    const rDAMAGE = totalDmg / expected.dmg,
        rSPOT = totalSpo / expected.spot,
        rFRAG = totalFrg / expected.frg,
        rDEF = totalDef / expected.def,
        rWIN = win / expected.win;

    const rWINc = Math.max(0, (rWIN - 0.71) / (1 - 0.71)),
        rDAMAGEc = Math.max(0, (rDAMAGE - 0.22) / (1 - 0.22)),
        rFRAGc = Math.min(rDAMAGEc + 0.2, Math.max(0, (rFRAG - 0.12) / (1 - 0.12))),
        rSPOTc = Math.min(rDAMAGEc + 0.1, Math.max(0, (rSPOT - 0.38) / (1 - 0.38))),
        rDEFc = Math.min(rDAMAGEc + 0.1, Math.max(0, (rDEF - 0.10) / (1 - 0.10)));

    return Math.round(980 * rDAMAGEc + 210 * rDAMAGEc * rFRAGc + 155 * rFRAGc * rSPOTc + 75 * rDEFc * rFRAGc + 145 * Math.min(1.8, rWINc)) || 0;
}

function getVehicleType(vehicleClass) {
    switch (vehicleClass.toLowerCase()) {
        case "lighttank":
            return "LT";
        case "mediumtank":
            return "MT";
        case "heavytank":
            return "HT";
        case "at-spg":
            return "TD";
        case "spg":
            return "SPG";
        default:
            return "unknown";
    }
}

function setVehicleStat(vehicleData, type, playerId) {
    const vehicleStat = { };
    const eventResult = eventPlayersData[playerId] && eventPlayersData[playerId][vehicleData.tank_id];

    if(eventResult) {
        vehicleStat.top_tankers_rank = eventResult;
    }

    vehicleData = vehicleData.statistics || vehicleData;
    vehicleStat.b = vehicleData[type].battles;
    vehicleStat.w = vehicleData[type].wins;
    vehicleStat.dmg = vehicleData[type].damage_dealt;
    vehicleStat.cap = vehicleData[type].capture_points;
    vehicleStat.def = vehicleData[type].dropped_capture_points;
    vehicleStat.frg = vehicleData[type].frags;
    vehicleStat.spo = vehicleData[type].spotted;
    vehicleStat.srv = vehicleData[type].survived_battles;

    return vehicleStat;
}
