1️⃣ Node.js is single-threaded (for JS execution)

Node.js runs your JavaScript code on one main thread, called the event loop.

That means only one JS instruction executes at a time.

So if you do CPU-heavy computation, it will block all other requests.

2️⃣ How Node.js handles multiple requests

Even though JS runs on a single thread, Node.js can handle thousands of requests concurrently using non-blocking I/O.

Example: reading a file, querying a database, making HTTP requests.

Node.js does not block while waiting for I/O.

Step by step flow

Request arrives → Node.js puts it in the event queue.

Event loop picks request → executes JS code until it hits async I/O.

I/O operation (DB, network, FS) → passed to libuv thread pool (background threads).

JS main thread is free → handles next request.

When I/O completes → callback or promise is pushed back to event loop queue → executed by JS thread.

3️⃣ libuv Thread Pool

Node.js uses libuv, which has a small thread pool (default 4 threads).

Handles tasks like:

File system operations

DNS lookups

Compression

Crypto

This allows Node.js to do true parallel I/O even with single JS thread.

4️⃣ Example
app.get("/data", async (req, res) => {
  const result = await db.query("SELECT * FROM accounts WHERE id = $1", [1]);
  res.json(result.rows[0]);
});


Timeline:

Request comes → JS code starts → calls db.query()

Node.js sends query to libuv thread pool / database driver → main thread free

Meanwhile, other requests handled by event loop

DB responds → callback queued → main thread executes response

5️⃣ CPU-bound vs I/O-bound
Type	Node behavior
I/O-bound	Handles thousands of concurrent requests → fast
CPU-bound	Blocks event loop → slows everything down

Solution for CPU-heavy tasks:

Use worker threads (worker_threads module)

Or move CPU-heavy work to microservices

6️⃣ So why it “feels like multi-threaded”?

Node.js does not create a JS thread per request

Instead, it uses async I/O + event loop + background threads (libuv) → can process thousands of requests concurrently without blocking

CPU-heavy operations are the only thing that block the single JS thread