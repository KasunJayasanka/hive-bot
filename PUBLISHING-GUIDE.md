# Publishing Guide for @kasunjayasanka/hive-bot-react

This guide covers multiple ways to publish and use the HiveBot React package.

## Table of Contents

1. [Publish to GitHub Packages](#1-publish-to-github-packages-recommended)
2. [Publish to npm Registry](#2-publish-to-npm-registry-alternative)
3. [Use Directly from GitHub](#3-use-directly-from-github-no-publishing)
4. [Local Development](#4-local-development)

---

## 1. Publish to GitHub Packages (Recommended)

GitHub Packages allows you to host packages in your GitHub repository.

### Prerequisites

You need a GitHub Personal Access Token (PAT) with `write:packages` permission.

#### Create a GitHub Token:

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Give it a name (e.g., "GitHub Packages")
4. Select scopes:
   - ✅ `write:packages` (Upload packages to GitHub Package Registry)
   - ✅ `read:packages` (Download packages from GitHub Package Registry)
   - ✅ `delete:packages` (Delete packages from GitHub Package Registry) - optional
5. Click "Generate token"
6. **Copy the token** (you won't see it again!)

### Step 1: Authenticate with GitHub Packages

```bash
# Set your GitHub username
export GITHUB_USERNAME=KasunJayasanka

# Set your GitHub token (paste the token you created)
export GITHUB_TOKEN=ghp_your_token_here

# Login to GitHub Packages
npm login --scope=@kasunjayasanka --registry=https://npm.pkg.github.com

# When prompted:
# Username: KasunJayasanka
# Password: <paste your GitHub token>
# Email: <your email>
```

Or create a `.npmrc` file in the package directory:

```bash
cd packages/hive-bot-react
cat > .npmrc << EOF
@kasunjayasanka:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
EOF
```

### Step 2: Build the Package

```bash
cd packages/hive-bot-react
npm install
npm run build
```

### Step 3: Publish to GitHub Packages

```bash
# Make sure you're in the package directory
cd packages/hive-bot-react

# Publish the package
npm publish
```

### Step 4: Installing from GitHub Packages

Users need to configure their `.npmrc` to use GitHub Packages:

**Project `.npmrc` file:**

```bash
# In your project root (where you want to use the package)
cat > .npmrc << EOF
@kasunjayasanka:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=\${GITHUB_TOKEN}
EOF
```

**Install the package:**

```bash
# Set your GitHub token
export GITHUB_TOKEN=ghp_your_token_here

# Install the package
npm install @kasunjayasanka/hive-bot-react
```

**Usage:**

```tsx
import { HiveBotProvider, ChatWidget } from '@kasunjayasanka/hive-bot-react'
import '@kasunjayasanka/hive-bot-react/styles.css'

function App() {
  return (
    <HiveBotProvider apiEndpoint="/api/rag/ask">
      <ChatWidget />
    </HiveBotProvider>
  )
}
```

---

## 2. Publish to npm Registry (Alternative)

If you want to publish to the public npm registry instead:

### Step 1: Update package.json

Remove or comment out the `publishConfig`:

```json
{
  "name": "@kasunjayasanka/hive-bot-react",
  "version": "1.0.0",
  // Comment out or remove this:
  // "publishConfig": {
  //   "registry": "https://npm.pkg.github.com"
  // }
}
```

Or use a different name without scope:

```json
{
  "name": "hive-bot-react",
  "version": "1.0.0"
}
```

### Step 2: Login to npm

```bash
npm login
# Enter your npm username, password, and email
```

### Step 3: Publish

```bash
cd packages/hive-bot-react
npm run build
npm publish --access public
```

### Step 4: Install from npm

```bash
npm install @kasunjayasanka/hive-bot-react
# or
npm install hive-bot-react
```

---

## 3. Use Directly from GitHub (No Publishing)

You can install directly from the GitHub repository without publishing to a registry.

### Option A: Install from Git URL

```bash
# Install from main branch
npm install git+https://github.com/KasunJayasanka/hive-bot.git#main

# Install from specific branch
npm install git+https://github.com/KasunJayasanka/hive-bot.git#claude/chatbot-package-library-01Cu8m1QDzqnXaYRDihnG3LZ

# Install from specific commit
npm install git+https://github.com/KasunJayasanka/hive-bot.git#d581623
```

**Note:** This installs the entire repository. You need to specify the package subdirectory in package.json:

```json
{
  "dependencies": {
    "@kasunjayasanka/hive-bot-react": "git+https://github.com/KasunJayasanka/hive-bot.git#main"
  }
}
```

### Option B: GitHub Releases (Recommended for Git installations)

1. Create a GitHub Release with the built package
2. Users can install from the release tarball

**Create a release:**

```bash
cd packages/hive-bot-react
npm run build
npm pack
# This creates kasunjayasanka-hive-bot-react-1.0.0.tgz
```

Upload this `.tgz` file to a GitHub Release, then install:

```bash
npm install https://github.com/KasunJayasanka/hive-bot/releases/download/v1.0.0/kasunjayasanka-hive-bot-react-1.0.0.tgz
```

---

## 4. Local Development

For local testing and development:

### Option A: npm link

```bash
# In the package directory
cd packages/hive-bot-react
npm link

# In your project directory
cd /path/to/your/project
npm link @kasunjayasanka/hive-bot-react
```

### Option B: File Path

```json
{
  "dependencies": {
    "@kasunjayasanka/hive-bot-react": "file:../hive-bot/packages/hive-bot-react"
  }
}
```

### Option C: Workspace (Monorepo)

If your project is in the same monorepo:

```json
{
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "dependencies": {
    "@kasunjayasanka/hive-bot-react": "workspace:*"
  }
}
```

---

## 5. Automated Publishing with GitHub Actions

Create `.github/workflows/publish-package.yml`:

```yaml
name: Publish Package

on:
  release:
    types: [created]
  workflow_dispatch:

jobs:
  publish:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          registry-url: 'https://npm.pkg.github.com'
          scope: '@kasunjayasanka'

      - name: Install dependencies
        run: |
          cd packages/hive-bot-react
          npm ci

      - name: Build package
        run: |
          cd packages/hive-bot-react
          npm run build

      - name: Publish to GitHub Packages
        run: |
          cd packages/hive-bot-react
          npm publish
        env:
          NODE_AUTH_TOKEN: ${{secrets.GITHUB_TOKEN}}
```

---

## Version Management

Update version before publishing:

```bash
cd packages/hive-bot-react

# Patch release (1.0.0 -> 1.0.1)
npm version patch

# Minor release (1.0.0 -> 1.1.0)
npm version minor

# Major release (1.0.0 -> 2.0.0)
npm version major
```

---

## Best Practices

1. **Always build before publishing:**
   ```bash
   npm run build
   ```

2. **Test the package locally first:**
   ```bash
   npm pack
   # Install the generated .tgz file in a test project
   ```

3. **Use semantic versioning:**
   - MAJOR version for incompatible API changes
   - MINOR version for backwards-compatible functionality
   - PATCH version for backwards-compatible bug fixes

4. **Update CHANGELOG.md** before each release

5. **Tag releases in Git:**
   ```bash
   git tag -a v1.0.0 -m "Release v1.0.0"
   git push origin v1.0.0
   ```

---

## Troubleshooting

### Error: "npm ERR! 404 Not Found"

- Make sure you're authenticated with the correct registry
- Check that the package name matches your GitHub username
- Verify the `.npmrc` configuration

### Error: "npm ERR! 403 Forbidden"

- Your token might not have `write:packages` permission
- Regenerate the token with correct permissions

### Error: "Package already exists"

- You can't republish the same version
- Update the version number in package.json

### Build artifacts missing

- Make sure to run `npm run build` before publishing
- Check that `dist/` directory exists and contains compiled files

---

## Quick Reference

### GitHub Packages Installation

```bash
# Create .npmrc
echo "@kasunjayasanka:registry=https://npm.pkg.github.com" > .npmrc
echo "//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}" >> .npmrc

# Install
export GITHUB_TOKEN=your_token
npm install @kasunjayasanka/hive-bot-react
```

### npm Registry Installation

```bash
npm install @kasunjayasanka/hive-bot-react
```

### Direct Git Installation

```bash
npm install git+https://github.com/KasunJayasanka/hive-bot.git#main
```

---

## Support

For issues and questions:
- GitHub Issues: https://github.com/KasunJayasanka/hive-bot/issues
- Package Documentation: [README.md](./packages/hive-bot-react/README.md)
