✅ 1. What is a Client?

In node-postgres, a client is a single, direct TCP connection to PostgreSQL.

const client = new Client()
await client.connect()


Characteristics:

It represents one active connection.

It can run only one SQL query at a time (PostgreSQL rule).

Opening it requires a handshake (20–30ms).

Must be manually closed or released.

✅ 2. What is a Pool?

A pool manages a fixed number of pre-opened clients (connections).

const pool = new Pool({ max: 10 })


Characteristics:

Creates several clients in advance.

Clients are reused for multiple queries.

Prevents creating too many connections.

Prevents exhausting PostgreSQL’s max_connections.

The pool automatically:

Opens connections

Reuses them

Releases them back

Manages idle timeout

Handles backend errors

✅ 3. Why Do You Need Pooling? (Official pg reasons, simplified)
Reason 1 — Creating a client is slow

Creating a new connection requires:

Authentication

SSL negotiation (if enabled)

Parameter sync

This costs ~20–30ms every time.

With a pool, this cost happens once, not every request.

Reason 2 — PostgreSQL has a limit on connections

Typical PostgreSQL limit:

max_connections = 100


If your server opens a new connection per request, you can quickly reach the limit → DB crash.

Pool ensures you only use a safe number of connections.

Reason 3 — One client can process only one query at a time

Postgres queues all queries coming through the same client:

Query 1 → runs
Query 2 → waits
Query 3 → waits


If your API uses only 1 client, your entire backend becomes serialized → extremely slow.

Pool solves this by distributing work across multiple clients.

Reason 4 — Prevent client leaks

Pool ensures:

Clients that fail return to pool

Idle clients don't stay forever

On shutdown, all clients close safely

If you manually create clients, you can easily forget to close them.

🔥 Summary (pure technical)
Feature	Client	Pool
Connections	1	Many (reused)
Query concurrency	1 at a time	Several at a time
Connection cost	High (every time)	Low (created once)
Risk of maxing out DB	Very high	Controlled
Best for	Single-use scripts	Web servers / APIs
❗ Conclusion

You should ALWAYS use a Pool for web servers or apps that make frequent queries.

Only use a raw Client for:

database migrations

one-time scripts

local tests

cron jobs