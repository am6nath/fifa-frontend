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
                    def changedFiles = currentBuild.changeSets.collect { changeSet ->
                        changeSet.items.collect { item ->
                            item.affectedPaths
                        }
                    }.flatten()

                    if (changedFiles && changedFiles.size() > 0) {
                        def frontendChanged = changedFiles.any { path -> path.startsWith('fifa-frontend/') }
                        if (!frontendChanged) {
                            currentBuild.result = 'SUCCESS'
                            currentBuild.description = 'Skipped: No changes detected in fifa-frontend'
                            echo "No changes detected in fifa-frontend. Skipping remaining stages."
                            error("Pipeline skipped because no files in fifa-frontend were changed.")
                        }
                    }
                    echo "Changes detected in fifa-frontend. Starting build process..."
                }
            }
        }

        stage('Install Dependencies') {
            steps {
                dir('fifa-frontend') {
                    echo 'Installing npm dependencies...'
                    sh 'npm ci'
                }
            }
        }

        stage('Lint & Test') {
            steps {
                dir('fifa-frontend') {
                    echo 'Running linter...'
                    sh 'npm run lint --if-present'
                    
                    echo 'Running tests...'
                    sh 'npm run test --if-present -- --watch=false --browsers=ChromeHeadless'
                }
            }
        }

        stage('Build Application') {
            steps {
                dir('fifa-frontend') {
                    echo 'Building production bundle...'
                    sh 'npm run build -- --configuration production'
                }
            }
        }

        stage('Docker Package') {
            steps {
                dir('fifa-frontend') {
                    echo 'Building Docker image...'
                    sh 'docker build -t fifa-frontend:latest .'
                }
            }
        }
    }
}
