#!/bin/bash

# HiveBot React Package Publishing Script
# Usage: ./scripts/publish.sh [version-type]
# version-type: patch, minor, major, or specific version like 1.2.3

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  HiveBot React Package Publisher${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if we're in the right directory
if [ ! -f "packages/hive-bot-react/package.json" ]; then
    echo -e "${RED}Error: Must run from repository root${NC}"
    exit 1
fi

cd packages/hive-bot-react

# Check if GITHUB_TOKEN is set
if [ -z "$GITHUB_TOKEN" ]; then
    echo -e "${YELLOW}Warning: GITHUB_TOKEN environment variable not set${NC}"
    echo "You'll need to authenticate manually during npm publish"
    echo ""
fi

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}Current version: ${CURRENT_VERSION}${NC}"

# Handle version argument
if [ -n "$1" ]; then
    if [[ "$1" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        # Specific version provided
        npm version "$1" --no-git-tag-version
        NEW_VERSION="$1"
    else
        # Version type provided (patch, minor, major)
        npm version "$1" --no-git-tag-version
        NEW_VERSION=$(node -p "require('./package.json').version")
    fi
    echo -e "${GREEN}New version: ${NEW_VERSION}${NC}"
else
    echo -e "${YELLOW}No version specified, using current version${NC}"
    NEW_VERSION="$CURRENT_VERSION"
fi

echo ""
echo -e "${BLUE}Step 1: Installing dependencies...${NC}"
npm install

echo ""
echo -e "${BLUE}Step 2: Running type check...${NC}"
npm run type-check

echo ""
echo -e "${BLUE}Step 3: Building package...${NC}"
npm run build

echo ""
echo -e "${BLUE}Step 4: Creating package tarball...${NC}"
npm pack

echo ""
echo -e "${GREEN}✓ Package built successfully!${NC}"
echo ""
echo "Package: @kasunjayasanka/hive-bot-react@${NEW_VERSION}"
echo "Tarball: kasunjayasanka-hive-bot-react-${NEW_VERSION}.tgz"
echo ""

# Ask for confirmation
read -p "Do you want to publish to GitHub Packages? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo ""
    echo -e "${BLUE}Step 5: Publishing to GitHub Packages...${NC}"
    npm publish

    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  Package published successfully! 🎉${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo "Package: @kasunjayasanka/hive-bot-react@${NEW_VERSION}"
    echo "Registry: GitHub Packages"
    echo ""
    echo "To install:"
    echo "  npm install @kasunjayasanka/hive-bot-react"
    echo ""
    echo "To use:"
    echo "  import { HiveBotProvider, ChatWidget } from '@kasunjayasanka/hive-bot-react'"
    echo "  import '@kasunjayasanka/hive-bot-react/styles.css'"
    echo ""

    # Git operations
    cd ../..
    if [ "$NEW_VERSION" != "$CURRENT_VERSION" ]; then
        read -p "Do you want to commit and tag this version? (y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            git add packages/hive-bot-react/package.json
            git commit -m "chore: bump @kasunjayasanka/hive-bot-react to v${NEW_VERSION}"
            git tag -a "v${NEW_VERSION}" -m "Release v${NEW_VERSION}"
            echo ""
            echo -e "${GREEN}✓ Changes committed and tagged${NC}"
            echo ""
            read -p "Do you want to push to remote? (y/n) " -n 1 -r
            echo
            if [[ $REPLY =~ ^[Yy]$ ]]; then
                git push
                git push --tags
                echo -e "${GREEN}✓ Changes pushed to remote${NC}"
            fi
        fi
    fi
else
    echo ""
    echo -e "${YELLOW}Publishing cancelled${NC}"
    echo "You can manually publish later with: npm publish"
fi
