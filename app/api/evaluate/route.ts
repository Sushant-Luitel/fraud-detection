import { NextResponse } from 'next/server';

export interface EvaluationRequest {
  accountId: string;
  accountAgeDays: number;
  recentDepositAmount: number;
  transferOutAmount: number;
  isSuspiciousIP: boolean;
  destinationAccount: string;
}

export interface EvaluationResult {
  id: string;
  timestamp: string;
  accountId: string;
  destinationAccount: string;
  score: number;
  status: 'APPROVED' | 'BLOCKED';
  explanations: string[];
}

// In-memory store (Shared globally in development/single-instance)
const flaggedTransactions: EvaluationResult[] = [];

export async function POST(request: Request) {
  try {
    const data: EvaluationRequest = await request.json();
    
    let score = 0;
    const explanations: string[] = [];

    // Rule 1: Dormancy/New Account Spike
    if (data.accountAgeDays < 10 && data.recentDepositAmount >= 100000) {
      score += 35;
      explanations.push('+35: Large inflow on newly opened or dormant account');
    }

    // Rule 2: Pass-Through Velocity
    if (data.recentDepositAmount > 0) {
      const velocity = data.transferOutAmount / data.recentDepositAmount;
      if (velocity >= 0.85) {
        score += 40;
        explanations.push('+40: Rapid cash-out velocity (>85% of recent funds transferred immediately)');
      }
    }

    // Rule 3: Device/IP Anomaly
    if (data.isSuspiciousIP) {
      score += 25;
      explanations.push('+25: Connection originated from flagged multi-login IP address');
    }

    // Decision Logic
    const status = score >= 75 ? 'BLOCKED' : 'APPROVED';

    const result: EvaluationResult = {
      id: Math.random().toString(36).substring(2, 15).toUpperCase(),
      timestamp: new Date().toISOString(),
      accountId: data.accountId,
      destinationAccount: data.destinationAccount,
      score,
      status,
      explanations
    };

    // Store in-memory if blocked
    if (status === 'BLOCKED') {
      flaggedTransactions.unshift(result);
      
      // Keep only recent 50 to avoid memory leak in long running process
      if (flaggedTransactions.length > 50) {
        flaggedTransactions.pop();
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
  }
}

export async function GET() {
  return NextResponse.json(flaggedTransactions);
}

export async function DELETE() {
  flaggedTransactions.length = 0;
  return NextResponse.json({ message: 'Cleared all alerts' });
}
