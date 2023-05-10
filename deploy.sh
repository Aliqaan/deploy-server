#!/bin/bash
gateway=$1
password=$2
function_name=$3
function_code=$4
architecture=$5

echo "gateway: $gateway"
echo "password: $password"
echo "function_name: $function_name"
echo "architecture: $architecture"

# Login to OpenFaaS
echo "Logging in to OpenFaaS..."
echo $password | sudo faas-cli login -g $gateway --password-stdin

# Directory for functions and yml file
# Change it in the deployed server
cd /home/ubuntu/functions

# Create new function
echo "Creating new function '$function_name'..."
sudo faas-cli new $function_name --lang python3

# Copy function code to function directory
echo "Copying function code to '$function_name' directory..."
echo "$function_code" | sudo tee ./$function_name/handler.py > /dev/null

# Modify the yml file with image name
echo "Writing yml file"
cat <<EOF | sudo tee ${function_name}.yml > /dev/null
version: 1.0
provider:
  name: openfaas
  gateway: ${gateway}
functions:
  ${function_name}:
    lang: python3
    handler: ./${function_name}
    image: alikaanbiber/faasd-test:latest
EOF

# Publish function Docker image to registry
echo "Publishing Docker image for '$function_name'..."
sudo faas-cli publish -f $function_name.yml --platforms $architecture

# Deploy Function to Faasd
echo "Deploying '$function_name' to Faasd..."
sudo faas-cli deploy -f $function_name.yml
