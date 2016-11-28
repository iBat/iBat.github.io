import Koa from 'koa';
import error from 'koa-error';
import jade from 'koa-jade-render';
import koaStatic from 'koa-static';
import path from 'path';
import routes from './routes';

const app = new Koa();

app.proxy = true;

app.use(jade(path.join(__dirname, 'views')));
app.use(koaStatic('public'));

app.use(error({
    engine: 'jade',
    template: __dirname + '/views/error.jade'
}));
app.use(routes.routes());

export default app;
