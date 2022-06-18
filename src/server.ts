import http from 'http';
import path from 'path';
import serveStatic from 'serve-static';
import render from './server-render';
// @ts-expect-error handle by rollup-plugin-string
import template from './index.html';

const PORT = Number(process.env.PORT) || 3000;
const serve = serveStatic(path.resolve(path.dirname(new URL(import.meta.url).pathname), '../client'));

http.createServer(async(req, res) => {
  const url = req.url as string;
  console.log(url);

  if (url.startsWith('/_assets/')) {
    serve(req, res, () => {
      res.statusCode = 404;
      res.end('Not Found');
    });
  } else {
    const { error, status, headers, body } = await render(
      {
        url,
        template,

        ctx: {
          cookies: req.headers.cookie
            ? Object.fromEntries(
              new URLSearchParams(req.headers.cookie.replace(/;\s*/g, '&')).entries()
            )
            : {},

          headers: req.headers
        }
      }
    );

    if (error) {
      console.error(error);
    }

    res.writeHead(status, headers);
    res.end(body);
  }
}).listen(PORT);
