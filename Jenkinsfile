pipeline {
    agent any
    
    environment {
        APP_NAME      = 'legalview'
    IMAGE_NAME    = 'legalview'
    REGISTRY      = 'docker.io/tharun03k'
    K8S_NAMESPACE = 'prod'
    BUILD_TAG     = "${BUILD_NUMBER}"
        GIT_SHORT_SHA = "${env.GIT_COMMIT?.take(7) ?: 'local'}"
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        disableConcurrentBuilds()
    }

    stages {
        // 🧰 STAGE 1: Environment Setup
        stage('Environment Setup') {
            steps {
                sh '''
                echo "=== Build Information ==="
                echo "Build Number: ${BUILD_NUMBER}"
                echo "Git Commit: ${GIT_COMMIT}"
                echo "=== System Information ==="
                python3 --version || true
                docker --version
                echo "=== Project Structure ==="
                ls -la
                '''
            }
        }

        // 🏗️ STAGE 2: Build Docker Image
        stage('Docker Build & Push') {
            steps {
                withCredentials([usernamePassword(credentialsId: 'dockerhub', usernameVariable: 'DH_USER', passwordVariable: 'DH_PASS')]) {
                    sh '''
                    echo "🏗️ Building Docker image..."
                    docker build -t ${IMAGE_NAME}:${GIT_SHORT_SHA} .
                    echo "$DH_PASS" | docker login -u "$DH_USER" --password-stdin
                    docker tag ${IMAGE_NAME}:${GIT_SHORT_SHA} ${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA}
                    docker push ${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA}
                    docker logout
                    '''
                }
            }
        }

        // ✅ STAGE 3: Test Docker Image
        stage('Smoke Test Container') {
            steps {
                sh '''
                echo "🔧 Running container sanity test..."
                docker run --rm ${REGISTRY}/${IMAGE_NAME}:${GIT_SHORT_SHA} sh -c "echo 'Container OK ✅'"
                '''
            }
        }

        // 🔵🟢 STAGE 4: Blue-Green Deployment
        stage('Blue-Green Deployment') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"
                    echo "🎯 Determining active color..."
                    ACTIVE=$(kubectl -n ${K8S_NAMESPACE} get svc ${APP_NAME} -o jsonpath='{.spec.selector.color}' 2>/dev/null || echo "blue")
                    if [ "$ACTIVE" = "blue" ]; then IDLE=green; else IDLE=blue; fi
                    echo "Active=$ACTIVE, Idle=$IDLE"

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

        // 🔁 STAGE 5: Switch Traffic
        stage('Switch Traffic') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"
                    IDLE=$(kubectl -n ${K8S_NAMESPACE} get deploy -l app=${APP_NAME},color!=blue -o jsonpath='{.items[0].metadata.labels.color}')
                    echo "Switching Service selector to color=${IDLE}"
                    PATCH_PAYLOAD=$(printf '{"spec":{"selector":{"app":"%s","color":"%s"}}}' "${APP_NAME}" "${IDLE}")
                    kubectl -n ${K8S_NAMESPACE} patch svc ${APP_NAME} --type=merge --patch "${PATCH_PAYLOAD}"
                    '''
                }
            }
        }

        // 🔍 STAGE 6: Post-Deployment Verification
        stage('Post-Deployment Verification') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"
                    echo "=== Health Check ==="
                    kubectl -n ${K8S_NAMESPACE} get pods -l app=${APP_NAME} -o wide
                    kubectl -n ${K8S_NAMESPACE} get svc ${APP_NAME}
                    '''
                }
            }
        }

        // 📈 STAGE 7: Metrics Health Check
        stage('Metrics Health Check') {
            steps {
                withCredentials([file(credentialsId: 'kubeconfig-prod', variable: 'KCFG')]) {
                    sh '''
                    export KUBECONFIG="$KCFG"
                    IDLE=$(kubectl -n ${K8S_NAMESPACE} get svc ${APP_NAME} -o jsonpath='{.spec.selector.color}')
                    echo "Querying Prometheus for color=${IDLE}"
                    IDLE_COLOR="${IDLE}" python3 <<'PY'
import json
import os
import sys
import subprocess
import urllib.parse

idle = os.environ['IDLE_COLOR']
query = f'sum(legalview_http_requests_total{{color="{idle}"}})'
encoded_query = urllib.parse.quote(query, safe='()[]{}=,"')
prom_path = "/api/v1/namespaces/monitoring/services/http:monitoring-kube-prometheus-prometheus:9090/proxy/api/v1/query?query=" + encoded_query

proc = subprocess.run(
    ["kubectl", "-n", "monitoring", "get", "--raw", prom_path],
    capture_output=True,
    text=True,
)

if proc.returncode != 0:
    print("kubectl query failed:", proc.stderr.strip())
    sys.exit(proc.returncode)

payload = json.loads(proc.stdout)

if payload.get('status') != 'success':
    print(f"Prometheus returned error: {payload}")
    sys.exit(1)

results = payload.get('data', {}).get('result', [])
if not results:
    print("No Prometheus metrics returned for legalview; failing health check.")
    sys.exit(1)

value = results[0].get('value', ['0', '0'])[1]
print(f"Prometheus query value: {value}")
PY
                    '''
                }
            }
        }
    }

    post {
        always {
            echo "🏁 Pipeline completed - Build ${BUILD_NUMBER}"
            sh '''
            echo "🧹 Cleaning up unused resources..."
            docker system prune -f || true
            '''
        }

        success {
            echo "✅ SUCCESS: Blue/Green deployment complete!"
        }

        failure {
            echo "❌ FAILURE: Deployment failed; old color remains active."
        }
    }
}
