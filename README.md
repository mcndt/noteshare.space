# 📝 Noteshare.space

**[Noteshare.space](https://noteshare.space)** is a service for sharing encrypted Markdown notes from Obsidian. Notes are end-to-end-encrypted and are only stored temporarily.

I created this service largely for my own use, as I was tired of relying on third-party services to quickly share some Markdown notes I wrote in Obsidian. Because I believe that others may find this useful, I chose to make it available as a public service.

![Preview of a noteshare.space shared note](/img/preview.png)


## Local development

Each subproject (plugin, server, and webapp) is its own npm package with its own configuration and build tooling:

```
| (root)
|-- package.json
|-- docker-compose.yml
|-- plugin/        // (Obsidian plugin, as submodule at mcndt/obsidian-note-sharing)
	|-- package.json
	|-- Dockerfile
|-- server/        // (Express + Prisma + SQLite)
	|-- package.json
	|-- Dockerfile
	|-- prisma/
		|--- Dockerfile
|-- webapp/        // (SvelteKit web application)
	|-- package.json
	|-- Dockerfile
```

It is necessary to run `npm install` in every subproject as well as the root.

The root package.json contains a `dev` script to facilitate simultaneous development of all three components:

```bash
npm run dev
```

Running the script starts a dev server for each, recompiling code on file changes. A reverse proxy (`proxy.js` in project root) runs the entire application at `http://localhost:5000`.

If you want to contribute solely to the Obsidian plugin, please pull from the [obsidian-note-sharing](https://github.com/mcndt/obsidian-note-sharing) repo directly.

Before you can store notes in the local development environment, you must migrate the local SQLite database (see next section).

### Local database

**SQLite** is used to store encrypted notes during local development as well as in production.

Before you can store notes during local development, you must migrate the local database:

```bash
npx prisma migrate deploy
```

To update the schema and add new migrations, please take a look at the [Prisma docs](https://www.prisma.io/docs/concepts/components/prisma-migrate).

### Docker Compose

You can run the docker-compose configuration used on the production server locally using the `docker-compose.yml` file provided in the project root directory:

```bash
docker-compose up --build
```

The compose configuration will:

1. Build images for the storage server, frontend app, and database migration service.
2. Mount a persistent volume for the SQLite database
3. Run [Traefik](https://traefik.io/traefik/) reverse proxy on port 5000
4. Automatically run `prisma migrate deploy` to keep the database schema up-to-date.
5. Start the storage service and web application after succesfuly database migration.

## Environment variables

Both the **webapp** and **server** have use environment variables for configuration.

The documentation for the environment variables of each process are kept in the `.env.example` files in their respective subdirectories.

### Setting environment variables in production

`.env` files are not used in docker-compose deployments.

Most env variables are set in the docker-compose file directly using the `environment` property. Build-time variables are set using the `args` property. See `docker-compose.yml` for an example.

## Deployment

I currently deploy the server + webapp using **Docker-compose**.

The host web server must combine the two services (webapp at port 3000, server at port 8080) into a single HTTPS service using a reverse proxy. I used [Traefik](https://doc.traefik.io/traefik/getting-started/quick-start/) in the example docker-compose. The following route mapping must be applied:

1. `https/POST @ /api/note` -> `http://0.0.0.0:8080/api/note`
2. `https/GET @ *` → `http://0.0.0.0:3000/*`

The reverse proxy is already set up for HTTP in the example docker compose file. some adaptations are still needed to enable TLS.

> [!Warning] Don’t forget to set up TLS!
> When deploying the application, it is strongly encouraged to run all traffic to the Traefik entrypoint over TLS, e.g. using a self-signed certificate or a cert signed by [letsencrypt](https://letsencrypt.org/).

### Caching

To limit load on the origin server, traffic to `https://noteshare.space/note/*` is proxied through Cloudflare servers. By default, Cloudflare does not cache HTML content.

To enable this, I added a **custom page rule** on `noteshare.space/note/*` to cache all content.

