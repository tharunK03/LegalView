pipeline {
  agent any

  environment {
    APP_NAME        = 'sai-baba'
    AWS_REGION      = 'ap-south-1'
    K8S_NAMESPACE   = 'prod'
    REGISTRY        = 'docker.io/tharun03k'
    IMAGE_NAME      = "${APP_NAME}"
    GIT_SHORT_SHA   = "${env.GIT_COMMIT?.take(7) ?: 'local'}"
  }

  parameters {
    choice(name: 'REGISTRY_TYPE', choices: ['ECR', 'DOCKER_HUB'], description: 'Where to push image')
  }

  options { timestamps() }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Build & Unit Test') {
      steps {
        sh '''
          echo "Run your tests here"
          # e.g., npm ci && npm test
        '''
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          docker build -t ${IMAGE_NAME}:${GIT_SHORT_SHA} .
        '''
      }
    }

    stage('Docker Login & Tag') {
      when { expression { params.REGISTRY_TYPE == 'ECR' } }
      environment {
        AWS_DEFAULT_REGION = "${AWS_REGION}"
      }
      steps {
        withAWS(credentials: 'aws-creds', region: "${AWS_REGION}") {
          sh '''
            aws ecr describe-repositories --repository-names ${IMAGE_NAME} || \
              aws ecr create-repository --repository-name ${IMAGE_NAME} >/dev/null

            export ECR_URI=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.${AWS_DEFAULT_REGION}.amazonaws.com
            aws ecr get-login-password --region ${AWS_DEFAULT_REGION} | docker login --username AWS --password-stdin ${ECR_URI}
            docker tag ${IMAGE_NAME}:${GIT_SHORT_SHA} ${ECR_URI}/${IMAGE_NAME}:${GIT_SHORT_SHA}
            docker push ${ECR_URI}/${IMAGE_NAME}:${GIT_SHORT_SHA}
            echo ${ECR_URI} > ecr_uri.txt
          '''
        }
      }
    }

    stage('Docker Login & Push (Docker Hub)') {
      when { expression { params.REGISTRY_TYPE == 'DOCKER_HUB' } }
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
            docker tag ${IMAGE_NAME}:${GIT_SHORT_SHA} ${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA}
            docker push ${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA}
          '''
        }
      }
    }

    stage('Determine Active Color') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            set +e
            ACTIVE=$(kubectl -n ${K8S_NAMESPACE} get svc ${APP_NAME} -o jsonpath='{.spec.selector.color}' 2>/dev/null)
            set -e
            if [ -z "$ACTIVE" ]; then
              ACTIVE=blue
            fi
            echo "Active color: $ACTIVE"
            if [ "$ACTIVE" = "blue" ]; then IDLE=green; else IDLE=blue; fi
            echo $ACTIVE > .active_color
            echo $IDLE > .idle_color
          '''
        }
      }
    }

    stage('Render & Deploy Idle Color') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            ACTIVE=$(cat .active_color)
            IDLE=$(cat .idle_color)

            # Resolve image reference
            if [ "${params.REGISTRY_TYPE}" = "ECR" ]; then
              ECR_URI=$(cat ecr_uri.txt)
              IMAGE="${ECR_URI}/${IMAGE_NAME}:${GIT_SHORT_SHA}"
            else
              IMAGE="${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA}"
            fi

            # Create namespace and service if first deploy
            kubectl apply -f k8s/ns.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/service.yaml

            # Render the right color deployment with image
            cp k8s/deploy-${IDLE}.yaml render.yaml
            sed -i.bak "s|REPLACEME_IMAGE:REPLACEME_TAG|${IMAGE}|g" render.yaml

            # Apply deployment and wait
            kubectl -n ${K8S_NAMESPACE} apply -f render.yaml
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/${APP_NAME}-${IDLE} --timeout=120s
          '''
        }
      }
    }

    stage('Smoke Test (Idle)') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            IDLE=$(cat .idle_color)
            # Add your real smoke test. Example: hit Pod IP via kubectl exec/curl.
            kubectl -n ${K8S_NAMESPACE} get pods -l app=${APP_NAME},color=${IDLE} -o name
          '''
        }
      }
    }

    stage('Switch Traffic to Idle Color') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            IDLE=$(cat .idle_color)
            echo "Switching Service selector to color=${IDLE}"
            kubectl -n ${K8S_NAMESPACE} patch svc ${APP_NAME} -p "{\"spec\":{\"selector\":{\"app\":\"${APP_NAME}\",\"color\":\"${IDLE}\"}}}"
          '''
        }
      }
    }

    stage('Post-Switch Verify') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            # Optional: wait a bit and probe the Service/Ingress here.
            sleep 5
            kubectl -n ${K8S_NAMESPACE} get svc ${APP_NAME} -o wide
          '''
        }
      }
    }
  }

  post {
    success {
      withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
        sh '''
          export KUBECONFIG="$KCFG"
          ACTIVE=$(cat .active_color)
          IDLE=$(cat .idle_color)

          # Optionally scale down old color to save cost after success
          kubectl -n ${K8S_NAMESPACE} scale deploy/${APP_NAME}-${ACTIVE} --replicas=0 || true
          echo "Blue-Green switch complete. Live color: ${IDLE}"
        '''
      }
    }
    failure {
      echo "Deployment failed. Service not switched; old color remains live."
    }
  }
}
