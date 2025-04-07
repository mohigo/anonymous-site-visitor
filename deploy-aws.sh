#!/bin/bash

# Exit on error
set -e

# Configuration
STACK_NAME="fusion-leap-mongodb"
REGION="us-east-1"  # Change this to your preferred region
MASTER_USERNAME="admin"
MASTER_PASSWORD=$(openssl rand -base64 12)  # Generate a random password

echo "🚀 Starting AWS deployment..."

# Create MongoDB instance
echo "📦 Creating MongoDB instance..."
aws cloudformation create-stack \
  --stack-name $STACK_NAME \
  --template-body file://mongodb-cloudformation.yml \
  --parameters \
    ParameterKey=MasterUsername,ParameterValue=$MASTER_USERNAME \
    ParameterKey=MasterUserPassword,ParameterValue=$MASTER_PASSWORD \
  --capabilities CAPABILITY_IAM \
  --region $REGION

echo "⏳ Waiting for MongoDB instance to be created..."
aws cloudformation wait stack-create-complete \
  --stack-name $STACK_NAME \
  --region $REGION

# Get MongoDB endpoint
MONGODB_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`MongoDBEndpoint`].OutputValue' \
  --output text)

MONGODB_PORT=$(aws cloudformation describe-stacks \
  --stack-name $STACK_NAME \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`MongoDBPort`].OutputValue' \
  --output text)

# Construct MongoDB URI
MONGODB_URI="mongodb://$MASTER_USERNAME:$MASTER_PASSWORD@$MONGODB_ENDPOINT:$MONGODB_PORT/visitor-analytics?retryWrites=true&w=majority"

echo "🔑 MongoDB Connection Details:"
echo "Endpoint: $MONGODB_ENDPOINT"
echo "Port: $MONGODB_PORT"
echo "URI: $MONGODB_URI"

# Update environment variables
echo "📝 Updating environment variables..."
cat > .env.production << EOL
MONGODB_URI=$MONGODB_URI
NODE_ENV=production
PORT=3000
EOL

echo "✅ Deployment script completed!"
echo "📋 Next steps:"
echo "1. Push these changes to your repository"
echo "2. Configure AWS Amplify with the new environment variables"
echo "3. Deploy your application" 