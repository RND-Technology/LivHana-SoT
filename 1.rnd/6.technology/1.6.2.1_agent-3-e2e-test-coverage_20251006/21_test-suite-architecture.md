### Test Suite Architecture

```
tests/
├── e2e/
│   ├── smoke/                          # Quick smoke tests (existing)
│   │   ├── e2e-full-system.spec.ts    ✅ EXISTS
│   │   └── e2e-full-suite.spec.ts     ✅ EXISTS
│   │
│   ├── integration/                    # Deep integration flows
│   │   ├── square-integration.spec.ts  ❌ NEEDS CREATION
│   │   ├── bigquery-pipeline.spec.ts   ❌ NEEDS CREATION
│   │   ├── membership-flow.spec.ts     ❌ NEEDS CREATION
│   │   ├── age-verification.spec.ts    ❌ NEEDS CREATION
│   │   ├── raffle-system.spec.ts       ❌ NEEDS CREATION
│   │   ├── voice-mode-e2e.spec.ts      ❌ NEEDS CREATION
│   │   └── autonomous-agent.spec.ts    ❌ NEEDS CREATION
│   │
│   ├── error-scenarios/                # Failure mode testing
│   │   ├── network-failures.spec.ts    ❌ NEEDS CREATION
│   │   ├── auth-failures.spec.ts       ❌ NEEDS CREATION
│   │   ├── external-api-down.spec.ts   ❌ NEEDS CREATION
│   │   └── data-validation.spec.ts     ❌ NEEDS CREATION
│   │
│   ├── performance/                    # Load & performance
│   │   ├── load-testing.spec.ts        ❌ NEEDS CREATION
│   │   ├── stress-testing.spec.ts      ❌ NEEDS CREATION
│   │   └── memory-profiling.spec.ts    ❌ NEEDS CREATION
│   │
│   └── security/                       # Security testing
│       ├── xss-protection.spec.ts      ❌ NEEDS CREATION
│       ├── csrf-protection.spec.ts     ❌ NEEDS CREATION
│       ├── sql-injection.spec.ts       ❌ NEEDS CREATION
│       └── auth-bypass.spec.ts         ❌ NEEDS CREATION
│
├── fixtures/                           # Test data & mocks
│   ├── auth-tokens.ts                  ❌ NEEDS CREATION
│   ├── mock-data.ts                    ❌ NEEDS CREATION
│   ├── test-users.ts                   ❌ NEEDS CREATION
│   └── api-responses.ts                ❌ NEEDS CREATION
│
└── helpers/                            # Test utilities
    ├── api-client.ts                   ❌ NEEDS CREATION
    ├── auth-helper.ts                  ❌ NEEDS CREATION
    ├── db-seeder.ts                    ❌ NEEDS CREATION
    └── assertion-helpers.ts            ❌ NEEDS CREATION
```
