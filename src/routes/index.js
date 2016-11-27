import Router from 'koa-router';

const router = Router();

router.get('/', ctx => {
    ctx.render('index');
});

export default router;
