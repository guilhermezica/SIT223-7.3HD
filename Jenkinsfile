pipeline {
    agent any
    triggers { pollSCM('H/2 * * * *') }
    stages {
        stage('Build') {
            steps {
                sh 'ls'
                echo 'Task: compile the source and package it into a deployable artefact'
            }
        }
        stage('Test') {
            steps {
                echo 'Task: run unit tests and integration tests'
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