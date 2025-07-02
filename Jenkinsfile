pipeline {
    agent any

    environment {
        DOCKER_IMAGE = 'aaleem1993/twnprojectjenkins'      
        DOCKER_CREDENTIALS_ID = 'docker-hub-creds'         
        GIT_CREDENTIALS_ID = 'git-ssh'
        EC2_SSH_CREDENTIALS_ID = 'demo-ec2-ssh' 
        EC2_HOST = 'ubuntu@ec2-3-94-152-136.compute-1.amazonaws.com'
        GIT_SSH_COMMAND = "ssh -o StrictHostKeyChecking=no"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Increment Version') {
            steps {
                sh 'npm version minor --no-git-tag-version'
            }
        }

        stage('Run Tests') {
            steps {
                sh 'npm test'
            }
        }

        stage('Build Docker Image') {
            steps {
               sh 'docker build -t ${DOCKER_IMAGE}:latest .'
            }
        }

        stage('Push Docker Image to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: "${DOCKER_CREDENTIALS_ID}",
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push ${DOCKER_IMAGE}:$latest
                    '''
                }
            }
        }

        stage('Commit Version Bump to GitHub') {
            steps {
                sshagent (credentials: [GIT_CREDENTIALS_ID]) {
                    sh '''
                        git config user.name "aaleem123"
                        git config user.email "attiaaleem@gmail.com"
                        git add package.json package-lock.json
                        git commit -m "version bump" 
                        git push origin HEAD:main
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent (credentials: [EC2_SSH_CREDENTIALS_ID]) {
                    sh '''
                        ssh -o StrictHostKeyChecking=no $EC2_HOST '
                            docker pull ${DOCKER_IMAGE}:$version &&
                            docker stop myapp || true &&
                            docker rm myapp || true &&
                            docker run -d --name myapp -p 3000:3000 ${IMAGE_TAG}
                        '
                    '''
                }
            }
        }
    }
}
