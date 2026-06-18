#!/bin/bash

# Setup Script for Love Memories Project (Multi-Profile Support)
# Handles missing packages, profile-based configurations, and database initialization.

# Text formatting helper (POSIX compliant using printf)
print_status() {
    printf "\033[1;34m==>\033[0m \033[1m%s\033[0m\n" "$1"
}

print_success() {
    printf "\033[1;32m==>\033[0m \033[1;32m%s\033[0m\n" "$1"
}

print_warning() {
    printf "\033[1;33m==>\033[0m \033[1;33mWARNING: %s\033[0m\n" "$1"
}

print_error() {
    printf "\033[1;31m==>\033[0m \033[1;31mERROR: %s\033[0m\n" "$1"
}

# 1. Check if Node.js is installed
print_status "Checking environment dependencies..."
if ! command -v node > /dev/null 2>&1; then
    print_error "Node.js is not installed."
    echo "Please install Node.js (version 18 or higher) first."
    echo "Visit: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    print_warning "Node.js version $NODE_VERSION detected. Next.js 14 requires version 18 or higher."
    echo "Please update Node.js to version 18+ to avoid runtime or build errors."
fi
print_success "Node.js version $NODE_VERSION is installed."

# 2. Check if npm is installed
if ! command -v npm > /dev/null 2>&1; then
    print_error "npm is not installed."
    echo "Please install npm (usually comes with Node.js) to manage dependencies."
    exit 1
fi
print_success "npm version $(npm -v) is installed."

# 3. Setup profiles (.env.development and .env.production)
if [ ! -f .env.development ]; then
    print_status "Creating .env.development from example..."
    cp .env.development.example .env.development
    print_warning ".env.development profile created. Please open it and configure development variables."
else
    print_success ".env.development profile already exists."
fi

if [ ! -f .env.production ]; then
    print_status "Creating .env.production from example..."
    cp .env.production.example .env.production
    print_warning ".env.production profile created. Please open it and configure production variables."
else
    print_success ".env.production profile already exists."
fi

# 4. Install npm dependencies
print_status "Installing project dependencies (npm install)..."
if npm install; then
    print_success "Dependencies installed successfully."
else
    print_error "npm install failed. Please check the logs above."
    exit 1
fi

# 5. Database client generation
print_status "Generating Prisma database client..."
if npx prisma generate; then
    print_success "Prisma Client generated successfully."
else
    print_error "Prisma Client generation failed."
    exit 1
fi

# 6. Database Schema Push option
echo ""
echo "Select database profile to apply schema migration (prisma db push):"
echo "1) Development Profile (.env.development)"
echo "2) Production Profile (.env.production)"
echo "3) Skip migration for now"
printf "Enter choice [1-3]: "
read -r db_choice

case $db_choice in
    1)
        ACTIVE_ENV=".env.development"
        ;;
    2)
        ACTIVE_ENV=".env.production"
        ;;
    *)
        ACTIVE_ENV=""
        ;;
esac

if [ -n "$ACTIVE_ENV" ]; then
    if grep -q "project-id" "$ACTIVE_ENV" || grep -q "anon-key-here" "$ACTIVE_ENV"; then
        print_warning "Environment variables in $ACTIVE_ENV are still placeholders."
        echo "Skip database schema migration. Please configure your actual keys in $ACTIVE_ENV, then run:"
        echo "  npx prisma db push"
    else
        print_status "Setting active profile to $ACTIVE_ENV..."
        cp "$ACTIVE_ENV" .env
        
        print_status "Pushing database schema to database..."
        if npx prisma db push; then
            print_success "Database schema pushed successfully."
            
            # Offer to seed database
            printf "Do you want to seed the database with sample data? (y/n) "
            read -r response_seed
            echo ""
            if [ "$response_seed" = "y" ] || [ "$response_seed" = "Y" ]; then
                print_status "Seeding database..."
                if npm run db:seed; then
                    print_success "Database seeded successfully."
                else
                    print_error "Failed to seed database."
                fi
            fi
        else
            print_error "Database connection failed. Please ensure your connection string in $ACTIVE_ENV is correct."
        fi
    fi
fi

print_success "Setup complete! Environment profiles created."
echo "Use './start.sh' to select a profile and launch the application."
