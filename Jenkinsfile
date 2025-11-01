pipeline {
  agent any

  environment {
    APP_NAME      = 'sai-baba'
    REGISTRY      = 'docker.io/tharun03k'
    IMAGE_NAME    = "${APP_NAME}"
    K8S_NAMESPACE = 'prod'
    GIT_SHORT_SHA = "${env.GIT_COMMIT?.take(7) ?: 'local'}"
  }

  options { timestamps() }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Docker Build & Push') {
      steps {
        withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
          sh '''
            echo "Building Docker image"
            docker build -t ${IMAGE_NAME}:${GIT_SHORT_SHA} .

            echo "Logging in to Docker registry"
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
            ACTIVE=$(kubectl -n ${K8S_NAMESPACE} get svc ${APP_NAME} -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "blue")
            if [ "$ACTIVE" = "blue" ]; then IDLE=green; else IDLE=blue; fi
            echo "Active=$ACTIVE, Idle=$IDLE"
            echo $ACTIVE > .active_color
            echo $IDLE > .idle_color
          '''
        }
      }
    }

    stage('Deploy to Idle Color') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            IDLE=$(cat .idle_color)
            IMAGE="${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA}"

            kubectl apply -f k8s/ns.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f k8s/service.yaml

            cp k8s/deploy-${IDLE}.yaml render.yaml
            sed -i.bak "s|REPLACEME_IMAGE:REPLACEME_TAG|${IMAGE}|g" render.yaml
            kubectl -n ${K8S_NAMESPACE} apply -f render.yaml
            kubectl -n ${K8S_NAMESPACE} rollout status deploy/${APP_NAME}-${IDLE} --timeout=90s
          '''
        }
      }
    }

    stage('Switch Traffic') {
      steps {
        withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
          sh '''
            export KUBECONFIG="$KCFG"
            IDLE=$(cat .idle_color)
            kubectl -n ${K8S_NAMESPACE} patch svc ${APP_NAME} -p "{\"spec\":{\"selector\":{\"app\":\"${APP_NAME}\",\"color\":\"${IDLE}\"}}}"
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
          ACTIVE=$(cat .active_color 2>/dev/null || echo "blue")
          IDLE=$(cat .idle_color 2>/dev/null || echo "green")
          kubectl -n ${K8S_NAMESPACE} scale deploy/${APP_NAME}-${ACTIVE} --replicas=0 || true
        '''
      }
      echo "Blue-green deployment successful."
    }
    failure {
      echo "Deployment failed. Active color remains live."
    }
  }
}
