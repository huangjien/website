# Phase 33 Discussion: Security and Deployment Workflow Hardening

## Context

Phase 30-32 delivered edge runtime migration, Tailscale connectivity, and proxy reliability controls.  
Phase 33 now focuses on hardening security posture and deployment workflow safety for this new topology.

## Goal for Phase 33

Reduce operational and security risk by tightening secret handling, least-privilege access, and deployment guardrails without increasing ongoing runtime cost.

## Hardening Options Considered

### Option A: Secrets + Least Privilege First (Selected)

- Prioritize secret exposure minimization and IAM rights reduction.
- Enforce strict access boundaries before adding broader workflow policy controls.

**Pros**

- Directly addresses highest-risk vectors (credential misuse and privilege sprawl).
- Improves blast-radius containment for compromised CI/deploy contexts.
- Aligns with selected priority.

**Cons**

- Some workflow guardrails may follow after IAM/secret refactors.

### Option B: Pipeline Guardrails First

- Prioritize CI/CD deployment protections (manual approvals, branch protections, policy checks).

**Pros**

- Fast visibility and control over deployment process safety.

**Cons**

- Leaves secret/permission exposure risks partially unresolved early.

### Option C: Runtime Isolation First

- Prioritize runtime hardening (container restrictions, stricter process/network constraints).

**Pros**

- Strong node/container level defense improvements.

**Cons**

- Does not directly reduce CI and secret management risks first.

## Selected Approach

Proceed with **Option A (Secrets + Least Privilege First)**, then layer workflow guardrails as part of the same phase execution slices.

## Execution Slices for Phase 33

### Slice 1: Secret and Identity Surface Reduction

- Review and minimize secrets injected into deploy workflow.
- Ensure only required secrets remain in deployment path.
- Convert static values to safer config references where applicable.

### Slice 2: IAM Least-Privilege Hardening

- Reduce Cloud Run deploy service account permissions to minimum required roles.
- Restrict Secret Manager access scope to exact secret resources.
- Validate no broad wildcard role grants remain in deploy path.

### Slice 3: Workflow Guardrails and Safety Checks

- Add deploy-time assertions for required secret presence and non-empty values.
- Add explicit fail-fast checks for unsafe configuration combinations.
- Tighten deployment command behavior to reduce accidental drift.

### Slice 4: Auditable Security Verification

- Add Phase 33 verification checks for:
  - secret exposure boundaries,
  - IAM role correctness,
  - guarded deployment behavior.
- Document rollback and incident-safe recovery path.

## Required Inputs for Plan Phase

- Target service account used in deploy pipeline
- Current IAM role assignments for deploy account and runtime account
- Secret inventory that must remain in Phase 33 deployment path
- Any organization policy constraints for Cloud Run and Secret Manager

## Risks and Controls

- Over-tightening IAM may break deployment unexpectedly.
  - Control: staged permission reduction with verification checkpoints.
- Removing required secrets may cause runtime failures.
  - Control: explicit required-secret assertions and smoke checks.
- Partial hardening may create false confidence.
  - Control: publish auditable verification checklist with pass/fail evidence.

## Recommendation

Move to `/gsd:plan-phase 33` to define exact IAM/secret changes, guardrail checks, and verification criteria for least-privilege deployment hardening.
