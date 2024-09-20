#!/bin/bash

# Docker credentials
DOCKER_USERNAME="beyondone"
DOCKER_PASSWORD="Vinno@123"

# Log in to Docker Hub
echo "Logging in to Docker Hub..."
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin
if [ $? -ne 0 ]; then
    echo "Docker login failed!"
    exit 1
fi

# Build and push backend Docker image
echo "Building and pushing backend Docker image..."
cd backend
docker build -t beyondone/beyondone-backend .
if [ $? -ne 0 ]; then
    echo "Failed to build backend Docker image!"
    exit 1
fi
docker push beyondone/beyondone-backend
if [ $? -ne 0 ]; then
    echo "Failed to push backend Docker image!"
    exit 1
fi
cd ..

# Build and push frontend Docker image
echo "Building and pushing frontend Docker image..."
cd beyond-front
docker build -t beyondone/beyondone-frontend .
if [ $? -ne 0 ]; then
    echo "Failed to build frontend Docker image!"
    exit 1
fi
docker push beyondone/beyondone-frontend
if [ $? -ne 0 ]; then
    echo "Failed to push frontend Docker image!"
    exit 1
fi
cd ..

echo "Docker images built and pushed successfully!"