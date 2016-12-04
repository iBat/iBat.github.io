import Router from 'koa-router';
import { repository } from '../repository';
import { topPlayers } from './players';
import { topClans } from './clans';

const router = Router();

router.get('/', ctx => {
    ctx.render('index');
});

router.get('/players', async(ctx) => {
    // const topPlayers = await repository.players.getTop();

    ctx.render('players', {
        top: {
            wn8: topPlayers,
            winRate: topPlayers
        }
    });
});

router.get('/players/:id', async(ctx) => {
    // const player = await repository.players.byId(ctx.params.id);
    const player = topPlayers.filter(player => player.id == ctx.params.id)[0];

    ctx.render('player', { player });
});

router.get('/clans', ctx => {
    ctx.render('clans', {
        top: {
            wn8: topClans,
            winRate: topClans
        }
    });
});


router.get('/clans/:id', async(ctx) => {
    // const player = await repository.players.byId(ctx.params.id);
    const clan = topClans.filter(clan => clan.id == ctx.params.id)[0];

    ctx.render('clan', { clan });
});

export default router;
