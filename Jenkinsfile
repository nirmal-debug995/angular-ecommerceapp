pipeline {
    agent any

    environment {
        ACR_NAME = "fullstackangularapp"
        ACR_LOGIN_SERVER = "fullstackangularapp.azurecr.io"
        RESOURCE_GROUP = "fullstackangular-rg"
        BACKEND_IMAGE = "backend:v1"
        FRONTEND_IMAGE = "frontend:v1"
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
                    sh 'docker build -t $ACR_LOGIN_SERVER/$BACKEND_IMAGE .'
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                dir('client') {
                    sh 'docker build -t $ACR_LOGIN_SERVER/$FRONTEND_IMAGE .'
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

        stage('Deploy to ACI') {
            steps {
                withCredentials([string(credentialsId: 'azure-sp-json', variable: 'AZURE_SP_JSON')]) {
                    sh '''
                    echo "Logging into Azure using Service Principal..."

                    echo $AZURE_SP_JSON > sp.json

                    export AZURE_CLIENT_ID=$(cat sp.json | jq -r .clientId)
                    export AZURE_CLIENT_SECRET=$(cat sp.json | jq -r .clientSecret)
                    export AZURE_TENANT_ID=$(cat sp.json | jq -r .tenantId)
                    export AZURE_SUBSCRIPTION_ID=$(cat sp.json | jq -r .subscriptionId)

                    az login --service-principal \
                      -u $AZURE_CLIENT_ID \
                      -p $AZURE_CLIENT_SECRET \
                      --tenant $AZURE_TENANT_ID

                    az account set --subscription $AZURE_SUBSCRIPTION_ID

                    echo "Deploying Backend..."

                    az container delete \
                      --name backend-aci \
                      --resource-group $RESOURCE_GROUP \
                      --yes || true

                    az container create \
                      --resource-group $RESOURCE_GROUP \
                      --name backend-aci \
                      --image $ACR_LOGIN_SERVER/$BACKEND_IMAGE \
                      --registry-login-server $ACR_LOGIN_SERVER \
                      --registry-username $ACR_USER \
                      --registry-password $ACR_PASS \
                      --dns-name-label backend-demo-123 \
                      --ports 5000 \
                      --environment-variables \
                        DB_HOST=20.40.61.186 \
                        DB_USER=ecomuser \
                        DB_PASSWORD=password \
                        DB_NAME=ecommerce \
                        PORT=5000 \
                      --os-type Linux

                    echo "Deploying Frontend..."

                    az container delete \
                      --name frontend-aci \
                      --resource-group $RESOURCE_GROUP \
                      --yes || true

                    az container create \
                      --resource-group $RESOURCE_GROUP \
                      --name frontend-aci \
                      --image $ACR_LOGIN_SERVER/$FRONTEND_IMAGE \
                      --registry-login-server $ACR_LOGIN_SERVER \
                      --registry-username $ACR_USER \
                      --registry-password $ACR_PASS \
                      --dns-name-label frontend-demo-123 \
                      --ports 80 \
                      --os-type Linux
                    '''
                }
            }
        }
    }
}
