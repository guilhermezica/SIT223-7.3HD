pipeline {
    agent any
    options { timeout(time: 15, unit: 'MINUTES') }
    tools { nodejs 'node-26' }
    environment { PATH = "/opt/homebrew/bin:/usr/local/bin:${env.PATH}" }
    triggers { pollSCM('H/2 * * * *') }
    stages {
        stage('Build') {
            steps {
                sh 'node -v && npm -v'
                echo 'Task: compile the source and package it into a deployable artefact'
                dir('frontend') {
                    sh 'npm ci'
                    sh 'npm run build'
                }
                dir('backend') {
                    sh 'npm ci'
                }
                archiveArtifacts artifacts: 'frontend/dist/**', fingerprint: true
                dir('backend') {
                   sh "docker build -t devdeakin-backend:${env.BUILD_NUMBER} ."
                }
            }
        }

        stage('Test') {
            steps {
                withCredentials([string(credentialsId: 'firebase-service-account', variable: 'FIREBASE_SERVICE_ACCOUNT')]) {
                    dir('backend') {
                        sh 'npm test'
                    }
                }
                junit 'backend/junit.xml'
            }
        }

        stage('Code Quality') {
            steps {
                withSonarQubeEnv('SonarCloud') {
                    sh "${tool 'sonar-scanner'}/bin/sonar-scanner -Dsonar.projectVersion=${env.BUILD_NUMBER}"
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        stage('Security') {
            steps {
                dir('backend') {
                    sh 'npm audit --audit-level=high'
                }
                sh "trivy image --scanners vuln --ignore-unfixed --quiet --severity HIGH,CRITICAL --exit-code 1 devdeakin-backend:${env.BUILD_NUMBER}"
                sh "trivy image --scanners vuln --format json -o trivy-report.json devdeakin-backend:${env.BUILD_NUMBER}"
                archiveArtifacts artifacts: 'trivy-report.json', fingerprint: true
            }
        }

        stage('Deploy') {
            steps {
                withCredentials([string(credentialsId: 'firebase-service-account', variable: 'FIREBASE_SERVICE_ACCOUNT')]) {
                    sh 'docker rm -f devdeakin-staging || true'
                    sh 'docker rm -f $(docker ps -aq --filter "publish=3001") 2>/dev/null || true'
                    sh "docker run -d --name devdeakin-staging -p 3001:3000 -e FIREBASE_SERVICE_ACCOUNT -e PORT=3000 devdeakin-backend:${env.BUILD_NUMBER}"
                    sh 'sleep 5'
                    sh 'curl -fsS http://localhost:3001/posts > /dev/null'
                }
                echo 'Staging is up on port 3001'
            }
        }

        stage('Release') {
            steps {
                echo 'Release: promote the app to production'
            }
        }

        stage('Monitoring') {
            steps {
                echo 'Monitoring: watch production and alert when it breaks'
            }
        }
    }
}