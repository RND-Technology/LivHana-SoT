# LivHana-SoT – Clean Repository Structure

LivHana-SoT/
├── .gitignore
├── README.md
├── Dockerfile
├── package.json
├── package-lock.json  # optional
│
├── src/               # Frontend app source
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
│
├── public/            # Static assets
│   └── index.html
│
├── backend/           # API / microservices
│   ├── main.py
│   └── requirements.txt
│
├── infra/             # IaC / deployment
│   ├── cloudbuild.yaml
│   └── terraform/
│
├── scripts/           # Utility scripts
│   ├── deploy_with_truth.sh
│   └── setup_cockpit.sh
│
├── tests/             # Unit/integration tests
│   └── test_app.py
│
└── docs/              # Architecture & team notes
    └── HIGH_FIVE_ARCHITECTURE.md
