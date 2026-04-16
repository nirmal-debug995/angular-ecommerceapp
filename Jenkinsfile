pipeline {
    agent any

    environment {
        ACR_NAME = "fullstackangularapp"
        ACR_LOGIN_SERVER = "fullstackangularapp.azurecr.io"

        RESOURCE_GROUP = "fullstackangular-rg"

        BACKEND_IMAGE = "backend:v1"
        FRONTEND_IMAGE = "frontend:v1"

        BACKEND_NAME = "backend-aci"
        FRONTEND_NAME = "frontend-aci"

        BACKEND_DNS = "backend-demo-123"
        FRONTEND_DNS = "frontend-demo-123"
    }

    stages {

        stage('Checkout Code') {
            steps {
                git credentialsId: 'github-creds',
                    url: 'https://github.com/nirmal-debug995/angular-ecommerceapp.git',
                    branch: 'main'
            }
        }

        stage('Build Backend Image') {
            steps {
                dir('backend') {
                    sh '''
                        docker build -t $ACR_LOGIN_SERVER/$BACKEND_IMAGE .
                    '''
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('client') {
                    sh '''
                        docker build -t $ACR_LOGIN_SERVER/$FRONTEND_IMAGE .
                    '''
                }
            }
        }

        stage('Login to ACR') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'acr-creds',
                    usernameVariable: 'ACR_USER',
                    passwordVariable: 'ACR_PASS'
                )]) {
                    sh '''
                        echo $ACR_PASS | docker login $ACR_LOGIN_SERVER \
                            -u $ACR_USER --password-stdin
                    '''
                }
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                    docker push $ACR_LOGIN_SERVER/$BACKEND_IMAGE
                    docker push $ACR_LOGIN_SERVER/$FRONTEND_IMAGE
                '''
            }
        }

        stage('Azure Login') {
            steps {
                withCredentials([
                    string(credentialsId: 'AZ_CLIENT_ID', variable: 'AZ_CLIENT_ID'),
                    string(credentialsId: 'AZ_CLIENT_SECRET', variable: 'AZ_CLIENT_SECRET'),
                    string(credentialsId: 'AZ_TENANT_ID', variable: 'AZ_TENANT_ID'),
                    string(credentialsId: 'AZ_SUB_ID', variable: 'AZ_SUB_ID')
                ]) {
                    sh '''
                        echo "Logging into Azure..."

                        az login --service-principal \
                          --username $AZ_CLIENT_ID \
                          --password $AZ_CLIENT_SECRET \
                          --tenant $AZ_TENANT_ID

                        az account set --subscription $AZ_SUB_ID
                    '''
                }
            }
        }

        stage('Deploy to ACI') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'acr-creds',
                    usernameVariable: 'ACR_USER',
                    passwordVariable: 'ACR_PASS'
                )]) {
                    sh '''
                        echo "Deploying Backend..."

                        az container delete \
                          --name $BACKEND_NAME \
                          --resource-group $RESOURCE_GROUP \
                          --yes || true

                        az container create \
                          --resource-group $RESOURCE_GROUP \
                          --name $BACKEND_NAME \
                          --image $ACR_LOGIN_SERVER/$BACKEND_IMAGE \
                          --registry-login-server $ACR_LOGIN_SERVER \
                          --registry-username $ACR_USER \
                          --registry-password $ACR_PASS \
                          --dns-name-label $BACKEND_DNS \
                          --ports 5000 \
                          --cpu 1 \
                          --memory 1.5 \
                          --environment-variables \
                            DB_HOST=20.40.61.186 \
                            DB_USER=ecomuser \
                            DB_PASSWORD=password \
                            DB_NAME=ecommerce \
                            PORT=5000 \
                          --os-type Linux

                        echo "Deploying Frontend..."

                        az container delete \
                          --name $FRONTEND_NAME \
                          --resource-group $RESOURCE_GROUP \
                          --yes || true

                        az container create \
                          --resource-group $RESOURCE_GROUP \
                          --name $FRONTEND_NAME \
                          --image $ACR_LOGIN_SERVER/$FRONTEND_IMAGE \
                          --registry-login-server $ACR_LOGIN_SERVER \
                          --registry-username $ACR_USER \
                          --registry-password $ACR_PASS \
                          --dns-name-label $FRONTEND_DNS \
                          --ports 80 \
                          --cpu 1 \
                          --memory 1.5 \
                          --os-type Linux
                    '''
                }
            }
        }
    }
}
