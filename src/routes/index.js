import Router from 'koa-router';
import { topPlayers } from './players';

const router = Router();

router.get('/', ctx => {
    ctx.render('index');
});

router.get('/players', ctx => {
    ctx.render('players', topPlayers.data);
});

router.get('/clans', ctx => {
    ctx.render('clans');
});

export default router;
