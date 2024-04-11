# Storage JSON Editor API

## google cloud setup

### create artifact repository

```bash
gcloud services enable artifactregistry.googleapis.com
gcloud artifacts repositories create zinovik-repository --location=europe-central2 --repository-format=docker
```

### create service account

```bash
gcloud iam service-accounts create github-actions
```

### add roles (`Service Account User`, `Cloud Build Service Account` and `Viewer`) to the service account you want to use to deploy the cloud run

```bash
gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:github-actions@zinovik-project.iam.gserviceaccount.com" --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:github-actions@zinovik-project.iam.gserviceaccount.com" --role="roles/cloudbuild.builds.builder"

gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:github-actions@zinovik-project.iam.gserviceaccount.com" --role="roles/viewer"
```

### creating keys for service account for github-actions `GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_FILE`

```bash
gcloud iam service-accounts keys create key-file.json --iam-account=github-actions@appspot.gserviceaccount.com
cat key-file.json | base64
```

### add access to secrets

```
gcloud projects add-iam-policy-binding zinovik-project --member="serviceAccount:306312319198-compute@developer.gserviceaccount.com" --role="roles/secretmanager.secretAccessor"
```

### add secrets

```
printf "JWT_SECRET" | gcloud secrets create storage-json-editor-api-jwt-secret --locations=europe-central2 --replication-policy="user-managed" --data-file=-
```
