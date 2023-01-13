RELEASE

NB: .npmrc allows us to access the private npm registry

1. docker build -t 662032958478.dkr.ecr.us-east-2.amazonaws.com/armscor-connect-ui-web:latest .
2. docker push 662032958478.dkr.ecr.us-east-2.amazonaws.com/armscor-connect-ui-web:latest

docker pull 662032958478.dkr.ecr.us-east-2.amazonaws.com/armscor-connect-ui-web;docker run --rm -d -p 3001:3000 --name armscor-connect-ui-web 662032958478.dkr.ecr.us-east-2.amazonaws.com/armscor-connect-ui-web
