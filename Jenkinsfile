pipeline {
    agent any

    triggers {
        githubPush()
    }

    options {
        timeout(time: 1, unit: 'HOURS')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        disableConcurrentBuilds()
    }

    stages {
        stage('Detect Changes') {
            steps {
                script {
                    echo "Changes detected in fifa-frontend repository. Starting build process..."
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                echo 'Installing npm dependencies...'
                bat 'npm ci'
            }
        }

        stage('Lint & Test') {
            steps {
                echo 'Running linter...'
                bat 'npm run lint --if-present'
                
                echo 'Running tests...'
                bat 'npm run test --if-present -- --watch=false --browsers=ChromeHeadless'
            }
        }

        stage('Build Application') {
            steps {
                echo 'Building production bundle...'
                bat 'npm run build -- --configuration production'
            }
        }

        stage('Docker Package') {
            steps {
                echo 'Pulling base images...'
                retry(2) {
                    bat 'docker pull node:20-alpine || exit /b 0'
                    bat 'docker pull nginx:stable-alpine || exit /b 0'
                }
                echo 'Building Docker image...'
                retry(3) {
                    bat 'docker build -t fifa-frontend:latest .'
                }
            }
        }
    }

    post {
        success {
            echo 'Deploying the updated frontend container...'
            bat 'docker compose -f ../fifa-backend/docker-compose.yml up -d frontend'
        }
    }
}
