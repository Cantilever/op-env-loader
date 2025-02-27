#!/usr/bin/env node

import { item, validateCli } from '@1password/op-js'
import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'

// Get the UUID from command line arguments
const args = process.argv.slice(2)
const uuid = args[0]

// Check if UUID is provided
if (!uuid) {
    console.log(chalk.red('Error: 1Password UUID is required'))
    console.log(chalk.yellow('Usage: npx op-env-loader <1password-uuid>'))
    process.exit(1)
}

validateCli().catch((error) => {
    console.log(chalk.red('1Password CLI is not valid:'), chalk.red(error.message))
    process.exit(1)
})

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

const env = await item.get(uuid, {
    fields: ['notesPlain'],
    format: 'json',
})

if (!env) {
    console.log(chalk.red(`Failed to retrieve the .env file for UUID: ${uuid}`))
    process.exit(1)
}

if (fs.existsSync('.env')) {
    rl.question(chalk.yellow('Warning: An .env file already exists. Do you want to overwrite it? (yes/no): '), (answer) => {
        if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
            writeEnvFile()
        } else {
            console.log(chalk.blue('Operation cancelled. Existing .env file was not modified.'))
            rl.close()
            process.exit(0)
        }
    })
} else {
    writeEnvFile()
}

function writeEnvFile() {
    try {
        fs.writeFileSync('.env', `${env.value}\n`)
        console.log(chalk.green('Successfully wrote the .env file'))
    } catch (error) {
        console.log(chalk.red('Failed to write the .env file:'), chalk.red(error.message))
        process.exit(1)
    } finally {
        rl.close()
    }
}
