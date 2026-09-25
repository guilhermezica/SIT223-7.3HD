pipeline {
    agent any
    options { timeout(time: 15, unit: 'MINUTES') }
    tools { nodejs 'node-26' }
    environment { PATH = "/usr/local/bin:${env.PATH}" }
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
            }
        }

        stage('Security') {
            steps {
                echo 'Task: scan the code and its dependencies for known vulnerabilities'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Task: deploy the packaged app to the staging server'
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