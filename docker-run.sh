#!/bin/bash

# Docker credentials (replace with your actual credentials)
DOCKER_USERNAME="beyondone"
DOCKER_PASSWORD="Vinno@123"

# Docker images
BACKEND_IMAGE="beyondone/beyondone-backend"
FRONTEND_IMAGE="beyondone/beyondone-frontend"

# Docker container names
BACKEND_CONTAINER_NAME="beyondone-backend"
FRONTEND_CONTAINER_NAME="beyondone-frontend"

# Docker ports
BACKEND_PORT=3000
FRONTEND_PORT=80

# Docker login
echo "Logging in to Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
if [ $? -ne 0 ]; then
    echo "Docker login failed!"
    exit 1
fi

# Pull Docker images
echo "Pulling Docker images..."
docker pull $BACKEND_IMAGE
if [ $? -ne 0 ]; then
    echo "Failed to pull backend Docker image!"
    docker logout
    exit 1
fi

docker pull $FRONTEND_IMAGE
if [ $? -ne 0 ]; then
    echo "Failed to pull frontend Docker image!"
    docker logout
    exit 1
fi

# Stop and remove existing containers (if any)
echo "Stopping and removing existing containers..."
docker stop $BACKEND_CONTAINER_NAME || true
docker rm $BACKEND_CONTAINER_NAME || true

docker stop $FRONTEND_CONTAINER_NAME || true
docker rm $FRONTEND_CONTAINER_NAME || true

# Run Docker containers
echo "Running backend Docker container..."
docker run -d --name $BACKEND_CONTAINER_NAME -p $BACKEND_PORT:3000 $BACKEND_IMAGE
if [ $? -ne 0 ]; then
    echo "Failed to run backend Docker container!"
    docker logout
    exit 1
fi

echo "Running frontend Docker container..."
docker run -d --name $FRONTEND_CONTAINER_NAME -p $FRONTEND_PORT:80 $FRONTEND_IMAGE
if [ $? -ne 0 ]; then
    echo "Failed to run frontend Docker container!"
    docker logout
    exit 1
fi

# Docker logout
echo "Logging out from Docker Hub..."
docker logout

echo "Docker containers are running successfully!"