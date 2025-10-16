#### Create Cloud Storage Bucket

```bash
# Create bucket for attachments
gsutil mb -l us -c STANDARD gs://livhana-gmail-attachments

# Set lifecycle policy (optional - delete files older than 7 years)
cat > lifecycle.json << EOF
{
  "lifecycle": {
    "rule": [
      {
        "action": {"type": "Delete"},
        "condition": {"age": 2555}
      }
    ]
  }
}
EOF

gsutil lifecycle set lifecycle.json gs://livhana-gmail-attachments
```
