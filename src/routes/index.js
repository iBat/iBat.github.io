import Router from 'koa-router';
import { repository } from '../repository';
import { topPlayers } from './players';
import { topClans } from './clans';

const router = Router();

router.get('/', ctx => {
    ctx.render('index');
});

router.get('/players', async(ctx) => {
    ctx.render('players', {
        top: {
            wn8: topPlayers,
            winRate: await repository.players.getTop('wins_ratio')
        }
    });
});

router.get('/players/:id', async(ctx) => {
    const player = await repository.players.byId(ctx.params.id);

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
