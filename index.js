#!/usr/bin/env node

'use strict'

/**
 * Dependencies
 */

const fs = require('fs')
const path = require('path')

/**
 * Constants
 */

const base = path.join(__dirname, '..', '..')
const package_json_path = path.join(base, 'package.json')
const index_js_path = path.join(base, 'index.js')

/**
 * Locals
 */

let main_script
let has_config = fs.existsSync(package_json_path)

/**
 * Set the main script to load
 */

if (has_config == false) {
  main_script = index_js_path
} else {
  let config = JSON.parse(fs.readFileSync(package_json_path))
  if (config.main === undefined || config.main === '') {
    main_script = index_js_path
  } else {
    main_script = path.resolve(config.main)
  }
}

/**
 * Load the main script
 */

let has_main_script = fs.existsSync(main_script)

if (has_main_script) {
  const app = require(main_script)

  /**
   * Ensure db interface exists
   */

  if (!Object.keys(app.locals).includes('db')) { throw Error('Missing db on app.locals {Object}.'); return }
  const db = app.locals.db

  /**
   * Query for current 'version' in the schema_migrations table
   */

  db.query('SELECT version FROM schema_migrations ORDER BY version DESC LIMIT 1;', [], (err, result) => {
    if (err) { throw err; return }
    if (result.rowCount > 0) {
      console.log(`Current version: ${result.rows[0].version}\n`)
    } else {
      console.log("Current version: null\n")
    }
    db.end()
  })
} else {
  throw Error("Missing 'main' in package.json and missing an index.js file.")
}
