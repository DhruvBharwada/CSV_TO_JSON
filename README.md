# CSV to JSON Converter API

This project implements a small Express API that converts a CSV file into nested
JSON objects, writes those objects into a PostgreSQL database and produces an
age–distribution report.  It has been designed with performance and
maintainability in mind: the CSV is streamed line by line to avoid loading the
entire file into memory, the database writes use batch inserts for speed and
the codebase follows a modular structure common to enterprise Node.js
projects.

## Features

* **Streaming CSV parser** – reads the input file using Node’s `fs` and
  `readline` modules.  Fields may be quoted and can contain commas.
* **Nested property support** – header names containing dots (`.`) are
  converted into nested objects (e.g. `address.city` becomes
  `{ address: { city: "…" } }`).
* **Mandatory field handling** – `name.firstName`, `name.lastName` and
  `age` are required; missing or invalid values are logged and the
  offending record is skipped.
* **PostgreSQL persistence** – records are inserted into a table that matches
  the provided schema.  Address fields are stored as JSONB and all extra
  properties are captured in an `additional_info` column.
* **Age distribution reporting** – after loading the CSV the service prints
  the percentage of users in four age ranges (`<20`, `20–40`, `40–60` and
  `>60`).  The distribution can also be retrieved via an API endpoint.

## Project Structure

```
csv-json-converter-api/
├── .env.example       # Example environment configuration file
├── package.json       # Project manifest with dependencies and scripts
├── README.md          # This file
└── src
    ├─images
    | ├── age_distribution_api.png
    │ └── load_api_png
    ├── app.js         # Entry point: sets up Express and routes
    ├── config
    │   ├── db.js      # PostgreSQL connection pool
    │   └── index.js   # Centralised configuration loader
    ├── controllers
    │   └── csvController.js  # Express route handlers
    ├── routes
    │   └── csvRouter.js      # Route definitions for the API
    ├── services
    │   ├── csvService.js     # CSV parsing and batch insertion logic
    │   └── userService.js    # Database operations
    └── utils
        ├── csvParser.js      # Low-level CSV parsing helpers
        └── objectUtils.js    # Helpers for nested objects
```

## Setup

1. **Install dependencies**

   Ensure you have Node.js installed (v16 or above).  Install the project
   dependencies with npm:

   ```bash
   npm install
   ```

2. **Create a `.env` file**

   Copy `.env.example` to `.env` and fill in the correct values for your
   PostgreSQL instance and the path to the CSV file.  For example:

   ```env
   PG_HOST=localhost
   PG_PORT=5432
   PG_USER=myuser
   PG_PASSWORD=secret
   PG_DATABASE=mydatabase
   CSV_FILE_PATH=/absolute/path/to/users.csv
   PORT=3000
   ```

3. **Create the database table**

   The application will automatically create the `users` table if it does not
   already exist.  No manual migration is required.

## Running the Application

Change into the project directory and start the Express server with:

```bash
cd csv-json-converter-api
npm start
```

The server will listen on the port configured in `.env` (default 3000).

### Loading the CSV

To process the CSV file and insert its contents into the database, send a
POST request to `/api/load`.  For example, using curl:

```bash
curl -X POST http://localhost:3000/api/load
```

The response will include the computed age distribution.  During
processing, progress is logged to the console.  Invalid rows are
reported and skipped.

### Retrieving Age Distribution

After the CSV has been loaded, you can fetch the current age distribution
without reprocessing the file via:

```bash
curl http://localhost:3000/api/age-distribution
```

This endpoint returns a JSON object mapping each age range to its
percentage of the total.

## Notes

* The CSV parser intentionally avoids third‑party packages in order to
  satisfy the challenge requirement of implementing a custom solution.
* Batch inserts improve performance when dealing with tens of thousands
  of rows, but the batch size can be tuned via the optional
  argument to `processCSVFile`.
* For production use consider adding input validation, authentication and
  more robust logging.  The current implementation focuses on clarity and
  the core requirements of the challenge.

## Postman response images 
 ![age distribution API](https://github.com/DhruvBharwada/CSV_TO_JSON/blob/eaad4fb03ecbdea398f34cc9da846c8854c12ff4/images/age_distribution_api.png)


![Load API](https://github.com/DhruvBharwada/CSV_TO_JSON/blob/eaad4fb03ecbdea398f34cc9da846c8854c12ff4/images/load_api.png)