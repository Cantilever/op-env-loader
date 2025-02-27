#!/usr/bin/env node

import { item, validateCli } from '@1password/op-js'
import fs from 'fs'
import chalk from 'chalk'
import readline from 'readline'
import { diffLines } from 'diff'

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
    // Read the local .env file
    const localEnv = fs.readFileSync('.env', 'utf8')
    const remoteEnv = `${env.value}\n`
    
    // Compare the local and remote .env files
    const diff = diffLines(localEnv, remoteEnv)
    
    // Check if there are differences
    const hasDifferences = diff.some(part => part.added || part.removed)
    
    if (!hasDifferences) {
        console.log(chalk.green('The local .env file is identical to the remote one. No changes needed.'))
        rl.close()
        process.exit(0)
    } else {
        // Display the differences
        console.log(chalk.yellow('Differences between local and remote .env files:'))
        diff.forEach(part => {
            // Use different colors for additions and removals
            const color = part.added ? chalk.green :
                          part.removed ? chalk.red : chalk.grey
            
            // Only show the first line of each change to avoid exposing sensitive data
            const lines = part.value.split('\n')
            const displayValue = lines.map(line => {
                if (!line) return line
                // Mask the actual values to protect sensitive data
                const keyValue = line.split('=')
                if (keyValue.length > 1) {
                    return keyValue[0] + '=[value hidden]'
                }
                return line
            }).join('\n')
            
            process.stdout.write(color(displayValue))
        })
        
        rl.question(chalk.yellow('\nDo you want to overwrite the local .env file with the remote one? (yes/no): '), (answer) => {
            if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
                writeEnvFile()
            } else {
                console.log(chalk.blue('Operation cancelled. Existing .env file was not modified.'))
                rl.close()
                process.exit(0)
            }
        })
    }
} else {
    console.log(chalk.blue('No local .env file found. Creating a new one.'))
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
