# op-env-loader

A utility for syncing environment variables from 1Password to your local `.env` file.

## Overview

`op-env-loader` is a command-line tool that pulls a secure note from your 1Password vault and saves it as a `.env` file in your project. This allows you to securely store and share environment variables with your team while keeping them in sync with a trusted source.

## Prerequisites

- [1Password](https://1password.com/) application installed on your computer
- 1Password CLI integration enabled (see setup instructions below)
- Node.js (version 14 or higher)

## Setup 1Password CLI Integration

1. Open 1Password application
2. Go to Settings/Preferences
3. Navigate to the "Developer" tab
4. Enable the "Integrate with 1Password CLI" option
5. Follow any additional prompts to complete the setup

## Installation

```bash
npm install -g op-env-loader
```

Or use it directly with npx:

```bash
npx op-env-loader <1password-uuid>
```

## Usage

1. Store your environment variables in a secure note in 1Password
2. Find the UUID of the secure note:
   - In 1Password, go to Settings/Preferences
   - Navigate to Advanced
   - Enable "Show debugging tools"
   - Right-click on your secure note in 1Password
   - Select "Copy item UUID" to copy the UUID to your clipboard
3. Run the command:

```bash
op-env-loader <1password-uuid>
```

## How It Works

- The tool connects to 1Password using the CLI integration
- It retrieves the secure note content using the provided UUID
- If no local `.env` file exists, it creates one with the content from 1Password
- If a local `.env` file already exists:
  - It compares the local file with the remote version
  - Shows a diff of the changes (with values hidden for security)
  - Asks for confirmation before overwriting the local file

## Features

- Secure synchronization of environment variables
- Diff view to see what's changing (without exposing sensitive values)
- Confirmation prompt before overwriting existing files
- Simple one-command operation

## Security Notes

- Your environment variables are never transmitted to any third-party servers
- All operations happen locally between your 1Password vault and your filesystem
- The tool masks actual values when showing diffs to prevent accidental exposure

## License

MIT

## Contributing

- Feel free to submit issues or pull requests to improve this package.

## Author

Cantilever

![npm](https://img.shields.io/npm/v/op-env-loader)
![License](https://img.shields.io/npm/l/op-env-loader)