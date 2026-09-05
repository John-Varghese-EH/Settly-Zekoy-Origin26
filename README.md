<div align="center">
  <img src="src/app/icon.svg" alt="Settly Logo" width="120" height="120" />
  <h1 align="center">Settly</h1>
  <p align="center">
    <strong>Autonomous Enterprise Reconciliation Agent</strong>
  </p>
  
  <p align="center">
    <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white" alt="Next.js" />
    <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    <img src="https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white" alt="Framer Motion" />
    <img src="https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black" alt="Firebase" />
    <img src="https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white" alt="Google Gemini" />
  </p>
</div>

<br />

Settly is an autonomous enterprise reconciliation agent designed specifically for the complexities of modern FinTech infrastructure. It acts as a financial command center, continuously monitoring, classifying, and resolving payment discrepancies across payment gateways, banking settlements, and internal ledgers.

The platform eliminates the need for manual spreadsheet matching. By leveraging an autonomous AI pipeline, Settly analyzes transaction data in real time, surfaces root causes for anomalies, and safely executes resolution workflows without requiring human intervention.

## The Problem It Solves

Financial operations teams often spend countless hours tracking down missing funds. A single transaction might be marked as captured in a payment gateway, settled in a bank account, but missing from the internal ledger due to data lag or API failures. Traditional reconciliation is slow, error prone, and scales poorly with transaction volume.

Settly replaces manual investigation with an intelligent autonomous loop.

## Core Capabilities

### 1. Multi System Trace
Settly ingests raw logs from disjointed systems and builds a unified timeline for any given transaction. It maps gateway captures to bank settlement batches and internal ledger postings.

### 2. Intent Classification and Scrubbing
User queries are scrubbed of Personally Identifiable Information before they ever reach the language model. The classification engine determines exact intent, allowing the agent to route the query to the correct internal tools.

### 3. Deterministic Reconciliation
We use a deterministic rules engine to classify discrepancies.
* **Data Lag**: Bank settled, ledger pending.
* **Fee Deduction**: Amount mismatches falling within standard tax or gateway fee margins.
* **In Cycle**: Transactions still within the standard T+1 settlement window.
* **Unexplained**: Critical anomalies that require immediate escalation.

### 4. Autonomous Resolution
When Settly detects a known pattern like a Data Lag, it does not just report the issue. It safely triggers a simulated ledger sync retry and logs the action in an immutable audit trail. Cases that fall below a strict confidence threshold are automatically escalated to human support teams.

## Technical Architecture

Settly is built on a modern, high performance stack designed for scale and security.

* **Framework**: Next.js 14 App Router for serverless execution and edge rendering.
* **UI and Styling**: Tailored glassmorphism aesthetic using Tailwind CSS and Framer Motion for fluid, hardware accelerated micro interactions.
* **Agent Pipeline**: A bespoke 7 step pipeline architecture separating PII scrubbing, intent classification, tool execution, and synthesis.
* **AI Integration**: Powered by the Gemini 2.5 Flash model for rapid, accurate natural language synthesis and decision routing.
* **Data Layer**: Configured for in memory processing to ensure maximum speed and compatibility with serverless environments.

## Local Development Setup

To run the Settly command center locally:

1. Clone the repository and install dependencies using standard Node package managers.
2. Create a `.env.local` file in the root directory.
3. Add your `GEMINI_API_KEY` to the environment variables.
4. Run the development server.

The application will be available on your local network. You can use the provided demo evaluator credentials to bypass the standard authentication flow.

## Design Philosophy

The interface was designed to feel like a premium command center rather than a standard dashboard. We prioritized high contrast typography, deep atmospheric backgrounds, and spatial clarity. Every interaction, from the initial query submission to the rendering of the discrepancy insight cards, is carefully animated to provide continuous visual feedback without feeling overwhelming.

Settly is not just a chatbot. It is a highly specialized financial tool built for precision, speed, and autonomy.
