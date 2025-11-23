# Creating Task Definitions in All Regions

## Prerequisites

1. Set AWS credentials in `.env`:
   ```env
   AWS_ACCESS_KEY_ID=your_access_key
   AWS_SECRET_ACCESS_KEY=your_secret_key
   AWS_ACCOUNT_ID=your_account_id  # Optional but recommended
   ```

2. Optional: Set IAM role ARNs (if different from defaults):
   ```env
   AWS_TASK_EXECUTION_ROLE_ARN=arn:aws:iam::ACCOUNT_ID:role/your-execution-role
   AWS_TASK_ROLE_ARN=arn:aws:iam::ACCOUNT_ID:role/your-task-role
   ```

## Running the Script

```bash
cd server
node scripts/createTaskDefinitions.js
```

## What It Does

- Creates `Chrome-Browser` and `Vivaldi-Browser` task definitions in all 11 regions
- Creates CloudWatch log groups for each task definition
- Skips task definitions that already exist
- Shows summary of created/skipped/errors

## Regions Covered

- ap-south-1 (Mumbai)
- us-east-1 (N Virginia)
- us-east-2 (Ohio)
- us-west-1 (N California)
- ap-northeast-2 (Seoul)
- ap-southeast-1 (Singapore)
- ca-central-1 (Canada)
- eu-west-2 (London)
- eu-west-3 (Paris)
- ap-northeast-3 (Osaka)
- us-west-2 (Oregon)

## Note on SNS Webhooks

The container updates endpoint at `/api/v1/containers/updates` is configured to receive SNS notifications. Make sure your SNS topic is configured to send webhooks to this endpoint.
