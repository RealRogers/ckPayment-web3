#!/bin/bash

# ICP Dashboard Deployment Script
# Supports blue-green deployment with health checks and rollback

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ENV_FILE="${PROJECT_DIR}/.env.production"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Load environment variables
if [[ -f "$ENV_FILE" ]]; then
    source "$ENV_FILE"
else
    log_error "Environment file not found: $ENV_FILE"
    exit 1
fi

# Default values
VERSION=${VERSION:-$(git rev-parse --short HEAD)}
ENVIRONMENT=${ENVIRONMENT:-production}
STRATEGY=${STRATEGY:-blue-green}
HEALTH_CHECK_TIMEOUT=${HEALTH_CHECK_TIMEOUT:-300}
ROLLBACK_ON_FAILURE=${ROLLBACK_ON_FAILURE:-true}

# Functions
show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] COMMAND

Commands:
    deploy          Deploy the application
    rollback        Rollback to previous version
    status          Show deployment status
    logs            Show application logs
    health          Check application health

Options:
    -v, --version VERSION       Version to deploy (default: git short hash)
    -e, --environment ENV       Environment (staging|production)
    -s, --strategy STRATEGY     Deployment strategy (blue-green|rolling)
    -t, --timeout SECONDS       Health check timeout (default: 300)
    -r, --no-rollback          Disable automatic rollback on failure
    -h, --help                 Show this help message

Examples:
    $0 deploy -v v1.2.3
    $0 rollback
    $0 status
    $0 logs -f
EOF
}

get_current_environment() {
    local current_env
    if docker-compose -f docker-compose.production.yml ps app-blue | grep -q "Up"; then
        if curl -sf "http://localhost:3000/health" > /dev/null 2>&1; then
            current_env="blue"
        fi
    fi
    
    if docker-compose -f docker-compose.production.yml ps app-green | grep -q "Up"; then
        if curl -sf "http://localhost:3001/health" > /dev/null 2>&1; then
            current_env="green"
        fi
    fi
    
    echo "${current_env:-blue}"
}

get_target_environment() {
    local current_env="$1"
    if [[ "$current_env" == "blue" ]]; then
        echo "green"
    else
        echo "blue"
    fi
}

wait_for_health() {
    local service="$1"
    local port="$2"
    local timeout="$3"
    local start_time=$(date +%s)
    
    log_info "Waiting for $service to be healthy (timeout: ${timeout}s)..."
    
    while true; do
        local current_time=$(date +%s)
        local elapsed=$((current_time - start_time))
        
        if [[ $elapsed -gt $timeout ]]; then
            log_error "Health check timeout for $service"
            return 1
        fi
        
        if curl -sf "http://localhost:$port/health" > /dev/null 2>&1; then
            log_success "$service is healthy"
            return 0
        fi
        
        log_info "Health check attempt $((elapsed / 10 + 1)) - waiting..."
        sleep 10
    done
}

run_smoke_tests() {
    local port="$1"
    local base_url="http://localhost:$port"
    
    log_info "Running smoke tests against $base_url..."
    
    # Basic health check
    if ! curl -sf "$base_url/health" > /dev/null; then
        log_error "Health check failed"
        return 1
    fi
    
    # Check API endpoints
    if ! curl -sf "$base_url/api/metrics" > /dev/null; then
        log_error "API metrics endpoint failed"
        return 1
    fi
    
    # Check static assets
    if ! curl -sf "$base_url/static/js/main.js" > /dev/null; then
        log_error "Static assets check failed"
        return 1
    fi
    
    # Performance check
    local response_time=$(curl -o /dev/null -s -w '%{time_total}' "$base_url")
    if (( $(echo "$response_time > 3.0" | bc -l) )); then
        log_warning "Slow response time: ${response_time}s"
    fi
    
    log_success "Smoke tests passed"
    return 0
}

switch_traffic() {
    local target_env="$1"
    local target_port
    
    if [[ "$target_env" == "blue" ]]; then
        target_port="3000"
    else
        target_port="3001"
    fi
    
    log_info "Switching traffic to $target_env environment..."
    
    # Update Traefik configuration
    cat > traefik-config/dynamic.yml << EOF
http:
  services:
    dashboard-active:
      loadBalancer:
        servers:
          - url: "http://app-$target_env:80"
EOF
    
    # Reload Traefik configuration
    docker-compose -f docker-compose.production.yml exec traefik \
        wget -qO- http://localhost:8080/api/providers/file/reload || true
    
    # Wait for traffic switch
    sleep 10
    
    # Verify traffic switch
    local current_version
    current_version=$(curl -s "http://localhost/api/version" | jq -r '.version // "unknown"')
    
    if [[ "$current_version" == "$VERSION" ]]; then
        log_success "Traffic successfully switched to $target_env"
        return 0
    else
        log_error "Traffic switch verification failed"
        return 1
    fi
}

deploy_blue_green() {
    local current_env
    local target_env
    local target_port
    
    current_env=$(get_current_environment)
    target_env=$(get_target_environment "$current_env")
    
    if [[ "$target_env" == "blue" ]]; then
        target_port="3000"
    else
        target_port="3001"
    fi
    
    log_info "Current environment: $current_env"
    log_info "Deploying to: $target_env"
    
    # Build and start target environment
    log_info "Building and starting $target_env environment..."
    
    DOCKER_IMAGE="icp-dashboard:$VERSION" \
    VERSION="$VERSION" \
    docker-compose -f docker-compose.production.yml up -d "app-$target_env"
    
    # Wait for target environment to be healthy
    if ! wait_for_health "$target_env" "$target_port" "$HEALTH_CHECK_TIMEOUT"; then
        log_error "Target environment failed to become healthy"
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            log_info "Cleaning up failed deployment..."
            docker-compose -f docker-compose.production.yml stop "app-$target_env"
        fi
        return 1
    fi
    
    # Run smoke tests
    if ! run_smoke_tests "$target_port"; then
        log_error "Smoke tests failed"
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            log_info "Cleaning up failed deployment..."
            docker-compose -f docker-compose.production.yml stop "app-$target_env"
        fi
        return 1
    fi
    
    # Switch traffic
    if ! switch_traffic "$target_env"; then
        log_error "Traffic switch failed"
        if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
            log_info "Rolling back traffic..."
            switch_traffic "$current_env"
            docker-compose -f docker-compose.production.yml stop "app-$target_env"
        fi
        return 1
    fi
    
    # Monitor for a few minutes
    log_info "Monitoring deployment for 2 minutes..."
    for i in {1..12}; do
        if ! curl -sf "http://localhost/health" > /dev/null; then
            log_error "Health check failed during monitoring"
            if [[ "$ROLLBACK_ON_FAILURE" == "true" ]]; then
                log_info "Rolling back due to health check failure..."
                switch_traffic "$current_env"
                docker-compose -f docker-compose.production.yml stop "app-$target_env"
            fi
            return 1
        fi
        
        log_info "Monitor check $i/12 - OK"
        sleep 10
    done
    
    # Stop old environment
    log_info "Stopping old environment: $current_env"
    docker-compose -f docker-compose.production.yml stop "app-$current_env"
    
    # Save deployment info
    cat > deployment-info.json << EOF
{
    "version": "$VERSION",
    "environment": "$target_env",
    "deploymentTime": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
    "previousEnvironment": "$current_env",
    "strategy": "blue-green"
}
EOF
    
    log_success "Blue-green deployment completed successfully!"
    log_info "Active environment: $target_env"
    log_info "Version: $VERSION"
    
    return 0
}

rollback_deployment() {
    local deployment_info
    local previous_env
    local current_env
    
    if [[ ! -f "deployment-info.json" ]]; then
        log_error "No deployment info found for rollback"
        return 1
    fi
    
    deployment_info=$(cat deployment-info.json)
    current_env=$(echo "$deployment_info" | jq -r '.environment')
    previous_env=$(echo "$deployment_info" | jq -r '.previousEnvironment')
    
    log_info "Rolling back from $current_env to $previous_env..."
    
    # Start previous environment
    docker-compose -f docker-compose.production.yml up -d "app-$previous_env"
    
    # Wait for health
    local previous_port
    if [[ "$previous_env" == "blue" ]]; then
        previous_port="3000"
    else
        previous_port="3001"
    fi
    
    if ! wait_for_health "$previous_env" "$previous_port" 120; then
        log_error "Previous environment failed to start"
        return 1
    fi
    
    # Switch traffic back
    if ! switch_traffic "$previous_env"; then
        log_error "Failed to switch traffic back"
        return 1
    fi
    
    # Stop current environment
    docker-compose -f docker-compose.production.yml stop "app-$current_env"
    
    log_success "Rollback completed successfully!"
    return 0
}

show_status() {
    log_info "Deployment Status"
    echo "===================="
    
    # Show running containers
    docker-compose -f docker-compose.production.yml ps
    
    # Show current version
    local current_version
    current_version=$(curl -s "http://localhost/api/version" 2>/dev/null | jq -r '.version // "unknown"')
    echo "Current version: $current_version"
    
    # Show environment
    local current_env
    current_env=$(get_current_environment)
    echo "Active environment: $current_env"
    
    # Show health status
    if curl -sf "http://localhost/health" > /dev/null 2>&1; then
        echo "Health status: ✅ Healthy"
    else
        echo "Health status: ❌ Unhealthy"
    fi
    
    # Show deployment info if available
    if [[ -f "deployment-info.json" ]]; then
        echo ""
        echo "Last deployment:"
        cat deployment-info.json | jq .
    fi
}

show_logs() {
    local follow_flag=""
    if [[ "${1:-}" == "-f" ]]; then
        follow_flag="--follow"
    fi
    
    docker-compose -f docker-compose.production.yml logs $follow_flag
}

check_health() {
    log_info "Checking application health..."
    
    # Check main endpoint
    if curl -sf "http://localhost/health" > /dev/null; then
        log_success "Main endpoint: ✅ Healthy"
    else
        log_error "Main endpoint: ❌ Unhealthy"
        return 1
    fi
    
    # Check API
    if curl -sf "http://localhost/api/metrics" > /dev/null; then
        log_success "API endpoint: ✅ Healthy"
    else
        log_error "API endpoint: ❌ Unhealthy"
        return 1
    fi
    
    # Check WebSocket (if available)
    if command -v wscat > /dev/null; then
        if timeout 5 wscat -c "ws://localhost/ws" --close > /dev/null 2>&1; then
            log_success "WebSocket: ✅ Healthy"
        else
            log_warning "WebSocket: ⚠️ Not available"
        fi
    fi
    
    log_success "Health check completed"
    return 0
}

# Main script logic
main() {
    local command=""
    local follow_logs=false
    
    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -v|--version)
                VERSION="$2"
                shift 2
                ;;
            -e|--environment)
                ENVIRONMENT="$2"
                shift 2
                ;;
            -s|--strategy)
                STRATEGY="$2"
                shift 2
                ;;
            -t|--timeout)
                HEALTH_CHECK_TIMEOUT="$2"
                shift 2
                ;;
            -r|--no-rollback)
                ROLLBACK_ON_FAILURE=false
                shift
                ;;
            -f)
                follow_logs=true
                shift
                ;;
            -h|--help)
                show_usage
                exit 0
                ;;
            deploy|rollback|status|logs|health)
                command="$1"
                shift
                ;;
            *)
                log_error "Unknown option: $1"
                show_usage
                exit 1
                ;;
        esac
    done
    
    # Validate command
    if [[ -z "$command" ]]; then
        log_error "No command specified"
        show_usage
        exit 1
    fi
    
    # Change to project directory
    cd "$PROJECT_DIR"
    
    # Execute command
    case $command in
        deploy)
            log_info "Starting deployment..."
            log_info "Version: $VERSION"
            log_info "Environment: $ENVIRONMENT"
            log_info "Strategy: $STRATEGY"
            
            if [[ "$STRATEGY" == "blue-green" ]]; then
                deploy_blue_green
            else
                log_error "Unsupported deployment strategy: $STRATEGY"
                exit 1
            fi
            ;;
        rollback)
            rollback_deployment
            ;;
        status)
            show_status
            ;;
        logs)
            if [[ "$follow_logs" == true ]]; then
                show_logs -f
            else
                show_logs
            fi
            ;;
        health)
            check_health
            ;;
        *)
            log_error "Unknown command: $command"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"