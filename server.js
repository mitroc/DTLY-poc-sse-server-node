import http from 'node:http';

function padTo2Digits(num) {
  return String(num).padStart(2, '0');
}

const server = http.createServer((req, res) => {
  console.log(`MTR: Requested URL: ${req.url}`);

  req.on('close', () => {
    if (!res.finished) {
      res.end();
      console.log('MTR: Server stopped sending events (client closed stream');
    }
  });

  if (req.url.toLowerCase() === '/events') {
    console.log('MTR: Request URL for events is valid');

    console.log('MTR: Setting proper headers');
    res.writeHead(200, {
      /**
       * The Connection general header controls whether the network
       * connection stays open after the current transaction finishes. If
       * the value sent is keep-alive, the connection is persistent and not
       * closed, allowing for subsequent requests to the same server to be done.
       * */
      'Connection': 'keep-alive',

      /**
       * In responses, a Content-Type header provides the client with the
       * actual content type of the returned content.
       * In practice, 'text/event-stream' informs the client that this
       * connection uses the Server-Sent Events protocol.
       * The event stream is a simple stream of text data which must be
       * encoded using UTF-8. Messages in the event stream are separated by
       * a pair of newline characters. A colon as the first character of a
       * line is in essence a comment, and is ignored.
       * */
      'Content-Type': 'text/event-stream',

      /**
       * The no-store response directive indicates that any caches of any
       * kind (private or shared) should not store this response.
       * */
      'Cache-Control': 'no-store',

      /**
       * The asterisk assigned to the Access-Control-Allow-Origin header
       * indicates that any client (from any domain) is authorized to access
       * this URL. It may not be the desired solution in a production
       * environment. In fact, in a production environment, we should adopt
       * a different approach, such as put the two applications under the
       * same domain (by using a reverse proxy), or by enabling CORS more
       * selectively (i.e. authorizing only specific domains).
       * */
      // 'Access-Control-Allow-Origin': '*',
    });
    console.log('MTR: Headers set');

    setInterval(() => {
      if (!res.finished) {
        const date = new Date();
        const hour = `${padTo2Digits(date.getHours())}:${padTo2Digits(
          date.getMinutes()
        )}:${padTo2Digits(date.getSeconds())}`;
        console.log('MTR: Sending heartbeat', hour);
        res.write('event: heartbeat\n');
        res.write(`data: ${hour}`);
        res.write('\n\n');
      }
    }, 53000);

    setTimeout(() => {
      if (!res.finished) {
        /**
         * This sends a chunk of the response body. This method may be called
         * multiple times to provide successive parts of the body.
         * */
        console.log('MTR: Sending event: flightStateUpdate');
        res.write('event: flightStateUpdate\n');
        res.write('data: {"flight": "I768", "state": "landing"}');
        res.write('\n\n');
      }
    }, 5000);

    setTimeout(() => {
      if (!res.finished) {
        console.log('MTR: Sending event: flightStateUpdate');
        res.write('event: flightStateUpdate\n');
        res.write('data: {"flight": "I768", "state": "landed"}');
        res.write('\n\n');
      }
    }, 10000);

    setTimeout(() => {
      if (!res.finished) {
        console.log('MTR: Sending event: flightRemoval');
        res.write('event: flightRemoval\n');
        res.write('data: {"flight": "I768"}');
        res.write('\n\n');
      }
    }, 15000);

    /**
     * In case the server stopped the connection, the client should
     * be informed to close the stream. Stopping by the server is not
     * implemented - it has to be done with res.end()
     * */
    // setTimeout(() => {
    //   if (!res.finished) {
    //     res.write('event: closedConnection\n');
    //     res.write('data: ');
    //     res.write('\n\n');
    //   }
    // }, 20000);
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.listen(process.env.PORT || 5000, () => {
  console.log(`Server running at port ${process.env.PORT || 5000}`);
});
