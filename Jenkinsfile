pipeline {
    agent any

    stages {
        stage('Git Pull') {
            steps {
                git branch: 'main', credentialsId: 'fa55b870-c34d-4a65-9572-08fc535de827', url: 'http://gitlab:4200/gitlab-instance-36507452/sofware-engineering-methodology'
            }
        }
        stage('npm') {
            steps {
                sh 'dir'
                nodejs(cacheLocationStrategy: workspace(), nodeJSInstallationName: 'NodeJS_v16.15.1') {
                    sh 'node -v'
                    sh 'npm -v'
                }
            }
        }
        stage('Install') {
            steps {
                nodejs(cacheLocationStrategy: workspace(), nodeJSInstallationName: 'NodeJS_v16.15.1') {
                    sh 'npm install'
                }
            }
        }
        stage('Lint') {
            steps {
                nodejs(cacheLocationStrategy: workspace(), nodeJSInstallationName: 'NodeJS_v16.15.1') {
                    sh 'npm run lint'
                }
            }
        }
        stage('Test') {
            steps {
                nodejs(cacheLocationStrategy: workspace(), nodeJSInstallationName: 'NodeJS_v16.15.1') {
                    sh 'npm run test'
                }
            }
        }
        stage('Build') {
            steps {
                nodejs(cacheLocationStrategy: workspace(), nodeJSInstallationName: 'NodeJS_v16.15.1') {
                    sh 'npm run build'
                }
            }
        }
    }
}