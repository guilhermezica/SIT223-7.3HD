pipeline {
    agent any
    options { timeout(time: 15, unit: 'MINUTES') }
    tools { nodejs 'node-24' }
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
                echo 'Task: run unit tests and integration tests'
                dir('backend') {
                    sh 'npm test'
                }
                junit 'backend/junit.xml'
            }
        }

        stage('Code Quality') {
            steps {
                echo 'Task: check the code against industry standards'
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