#!/bin/bash

# Start Script for Love Memories Project (Multi-Profile Support & Background Execution)
# Helps running the app using Development or Production profiles, with background execution support.

print_status() {
    printf "\033[1;34m==>\033[0m \033[1m%s\033[0m\n" "$1"
}

print_success() {
    printf "\033[1;32m==>\033[0m \033[1;32m%s\033[0m\n" "$1"
}

print_error() {
    printf "\033[1;31m==>\033[0m \033[1;31mERROR: %s\033[0m\n" "$1"
}

# 1. Select Profile
echo "Select environment profile to launch:"
echo "1) Development Profile (.env.development)"
echo "2) Production Profile (.env.production)"
printf "Enter choice [1-2]: "
read -r profile_choice

case $profile_choice in
    1)
        ACTIVE_ENV=".env.development"
        RUN_DEV=true
        PM2_NAME="love-memories-dev"
        LOG_FILE="dev-server.log"
        ;;
    2)
        ACTIVE_ENV=".env.production"
        RUN_DEV=false
        PM2_NAME="love-memories"
        LOG_FILE="prod-server.log"
        ;;
    *)
        print_error "Invalid option."
        exit 1
        ;;
esac

# Check if selected profile exists
if [ ! -f "$ACTIVE_ENV" ]; then
    print_error "Profile file $ACTIVE_ENV does not exist."
    echo "Please run './setup.sh' to initialize profiles first."
    exit 1
fi

# Check for environment configuration placeholders
if grep -q "project-id" "$ACTIVE_ENV" || grep -q "anon-key-here" "$ACTIVE_ENV"; then
    print_error "Please configure your actual database and Supabase keys in $ACTIVE_ENV before starting the server."
    exit 1
fi

# Copy chosen profile to active .env
print_status "Setting active profile to $ACTIVE_ENV..."
cp "$ACTIVE_ENV" .env

# Verify node_modules exists
if [ ! -d node_modules ]; then
    print_status "node_modules is missing. Running npm install..."
    if ! npm install; then
        print_error "npm install failed."
        exit 1
    fi
fi

# 2. Select Execution Mode (Foreground vs Background)
echo ""
echo "Select execution mode:"
echo "1) Run in Foreground (hangs terminal, displays console logs)"
echo "2) Run in Background (detached, does not hang terminal)"
printf "Enter choice [1-2]: "
read -r exec_choice


# Launch Server
case $exec_choice in
    1)
        # Foreground Execution
        if [ "$RUN_DEV" = true ]; then
            print_status "Starting Development Server in foreground..."
            npm run dev
        else
            print_status "Starting Production Server in foreground..."
            npm run start
        fi
        ;;
    2)
        # Background Execution (Check PM2 first, fallback to nohup)
        if command -v pm2 > /dev/null 2>&1; then
            print_status "PM2 detected. Launching application via PM2..."
            
            # Stop existing process with the same name if running
            pm2 stop "$PM2_NAME" > /dev/null 2>&1
            pm2 delete "$PM2_NAME" > /dev/null 2>&1
            
            if [ "$RUN_DEV" = true ]; then
                pm2 start npm --name "$PM2_NAME" -- run dev
            else
                pm2 start npm --name "$PM2_NAME" -- start
            fi
            
            print_success "Application started successfully under PM2 in background!"
            echo "You can check status using: pm2 status"
            echo "You can view logs using:   pm2 logs $PM2_NAME"
        else
            print_warning "PM2 is not installed. Falling back to nohup..."
            
            if [ "$RUN_DEV" = true ]; then
                nohup npm run dev > "$LOG_FILE" 2>&1 &
            else
                nohup npm run start > "$LOG_FILE" 2>&1 &
            fi
            
            PID=$!
            print_success "Application started in background using nohup!"
            echo "Process ID (PID): $PID"
            echo "Console logs are being saved to: ./$LOG_FILE"
            echo "To stop this application, run:    kill $PID"
        fi
        ;;
    *)
        print_error "Invalid option."
        exit 1
        ;;
esac
